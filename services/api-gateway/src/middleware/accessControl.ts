import { Request, Response, NextFunction } from 'express';
import ipRangeCheck from 'ip-range-check';
import { db } from '../services/database';
import crypto from 'crypto';

const ALLOWED_CIDR_BLOCKS = process.env.ALLOWED_CIDR_BLOCKS?.split(',') || ['0.0.0.0/0'];
const DEVICE_VALIDATION_DAYS = Number.isInteger(parseInt(process.env.DEVICE_VALIDATION_DAYS || '')) && parseInt(process.env.DEVICE_VALIDATION_DAYS || '') > 0
  ? parseInt(process.env.DEVICE_VALIDATION_DAYS as string, 10)
  : 365;

// Generate a consistent device identifier from browser fingerprint
function generateDeviceIdentifier(req: Request): string {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
}

// Get client IP address (handles proxies)
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '0.0.0.0';
}

export async function accessControlMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const clientIp = getClientIp(req);
  const deviceId = generateDeviceIdentifier(req);
  
  try {
    // Check if IP is in allowed CIDR blocks
    const isIpAllowed = ALLOWED_CIDR_BLOCKS.some(cidr => 
      ipRangeCheck(clientIp, cidr)
    );

    if (isIpAllowed) {
      // IP is allowed - validate/update device
      await validateDevice(deviceId, clientIp);
      await logAccess(clientIp, req.headers['user-agent'], true, null);
      return next();
    }

    // Check if device was previously validated
    const deviceValid = await checkDeviceValidation(deviceId);
    
    if (deviceValid) {
      await logAccess(clientIp, req.headers['user-agent'], true, 'validated_device');
      return next();
    }

    // Access denied
    await logAccess(clientIp, req.headers['user-agent'], false, 'ip_not_in_range');
    
    res.status(403).json({
      error: 'Access Denied',
      message: 'Access to BucStop is restricted to ETSU network connections.',
      info: 'Please connect from an ETSU network or visit https://www.etsu.edu/cbat/computing/ for more information.'
    });
  } catch (error) {
    console.error('Access control error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function validateDevice(deviceId: string, ipAddress: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + DEVICE_VALIDATION_DAYS);

  await db.query(
    `INSERT INTO validated_devices (device_identifier, ip_address, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (device_identifier)
     DO UPDATE SET last_validated_at = CURRENT_TIMESTAMP, expires_at = $3, ip_address = $2`,
    [deviceId, ipAddress, expiresAt]
  );
}

async function checkDeviceValidation(deviceId: string): Promise<boolean> {
  const result = await db.query(
    `SELECT id FROM validated_devices
     WHERE device_identifier = $1 AND expires_at > CURRENT_TIMESTAMP`,
    [deviceId]
  );
  
  return result.rows.length > 0;
}

async function logAccess(
  ipAddress: string,
  userAgent: string | string[] | undefined,
  granted: boolean,
  reason: string | null
): Promise<void> {
  const userAgentStr = Array.isArray(userAgent) ? userAgent[0] : userAgent;
  
  await db.query(
    `INSERT INTO access_logs (ip_address, user_agent, access_granted, failure_reason)
     VALUES ($1, $2, $3, $4)`,
    [ipAddress, userAgentStr, granted, reason]
  );
}
