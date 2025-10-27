# BucStop: Requirements Document (Node.js/TypeScript Transition)

**Version:** 1.0  
**Date:** 2025-10-26

---

## 1. Introduction

### 1.1 Vision
A website built by ETSU Students for ETSU Students to upload and share browser-based games they have created, allowing fellow students to play them between classes.

### 1.2 Objectives
- Host a collection of classic arcade-style games developed by ETSU students.
- Ensure games are playable within approximately 20 minutes and include a scoring system with leaderboard registration.
- Provide a mechanism for students to submit new games and updates.
- Ensure games are playable offline after initial load.
- Track game popularity and usage statistics for student resumes and site improvement.
- Implement security measures to restrict access primarily to the ETSU network.
- Build a maintainable and scalable system using modern web technologies.

---

## 2. User Roles
- **Player:** Anyone connecting to the website via an authorized method (primarily ETSU network) who can browse and play available games.  
- **Game Builder:** An ETSU student who designs, builds, and submits games/updates adhering to the defined criteria.  
- **(Implicit) Administrator:** Responsible for system maintenance, deployment, and potentially moderating submissions (automation preferred).

---

## 3. System Architecture

**Model:** Client-Server Architecture  
**Style:** Microservices Architecture

**Implementation:**
- **Backend Services:** Node.js with TypeScript, using the Express.js framework.
- **Frontend (Main App):** Single Page Application (SPA) framework (React or Vue.js recommended).
- **Games:** Self-contained HTML/CSS/JavaScript applications loaded into browser frames.
- **Database:** PostgreSQL for persistent storage (leaderboards, stats, service registry).
- **Containerization:** Docker for packaging each microservice (Web App, API Gateway, each Game Service, Database).
- **Deployment:** Docker Compose for local/development, potentially AWS ECS/Kubernetes via GitHub Actions for staging/production.

---

## 4. Functional Requirements

### 4.1 Security & Access Control (API Gateway / Infrastructure)
- **SEC-001:** Access primarily limited to connections from ETSU network IP ranges (CIDR blocks).
- **SEC-002:** API Gateway must validate source IP address of incoming requests.
- **SEC-003:** Invalid access attempts (outside CIDR blocks, not meeting exception criteria) shall be redirected to a static informational page about ETSU's computing department.
- **SEC-004:** System may store MAC address (or derived, anonymized identifier) upon successful ETSU network connection. (Note: MAC retrieval from browsers is typically not possible; prefer IP-based or anonymized browser storage.)
- **SEC-005:** If MAC tracking is feasible, devices validated via ETSU network may be granted outside access for up to one year since last validated connection.
- **SEC-006:** System shall monitor and log unauthorized access attempts.
- **SEC-007:** Consider automated alerts (email/SMS) if unauthorized attempts exceed thresholds (potential DoS).
- **SEC-008:** Implement a process (manual/automated) to analyze submitted game code for potentially malicious content before deployment.

### 4.2 Player Experience (Web App Frontend & API Gateway)
- **PLR-001:** Present players with a list/carousel of available games on access.
- **PLR-002:** Game list must include at minimum the game's name and an image/thumbnail.
- **PLR-003:** Players can select a game to view more information.
- **PLR-004:** Game information must include:
  - Game image/screenshot
  - Game description
  - Instructions on how to play
  - Current game version (Semantic Versioning)
  - Author(s) name(s)
  - Release notes
  - Current Top 10 Leaderboard for that game
- **PLR-005:** Players can activate (launch) any available game to play.
- **PLR-006:** Players can exit any game at any time.
- **PLR-007:** Upon achieving a Top 10 score, players prompted to register initials (max 3 characters).
- **PLR-008:** Players can view overall site statistics (e.g., Top 10 most played games).
- **PLR-009:** Players can submit trouble tickets or feedback for a specific game or the website.

### 4.3 Game Requirements (Game Client & Game Service API)
- **GAM-001:** Games developed using HTML, CSS, and JavaScript.
- **GAM-002:** Games fully loadable into a browser frame (e.g., an `<iframe>`).
- **GAM-003:** Games remain playable if the network is lost after initial load.
- **GAM-004:** Games requiring server communication must implement retry logic for temporary network disruptions.
- **GAM-005:** Games implement a scoring system resulting in a final score upon completion.
- **GAM-006:** Games provide an interface to submit a score and player initials upon completion:

  POST /api/games/{gameName}/score  
  Payload:
  ```json
  { "initials": "XYZ", "score": 12345 }
  ```

- **GAM-007:** Games must not require personally identifying information (PII).
- **GAM-008:** Games may use local storage or cookies for optional enhancements but must function without them.
- **GAM-009:** Game services shall expose a health check endpoint: `GET /health`
- **GAM-010:** Game services shall expose an endpoint to serve static game files: `GET /play`
- **GAM-011:** Game services (or the API Gateway) shall expose an endpoint to retrieve the game's leaderboard: `GET /api/games/{gameName}/leaderboard`

### 4.4 Game Management & Submission (API Gateway & Potential Admin Interface)
- **MGT-001:** Provide a mechanism (preferably automated) for Game Builders to submit new games.
- **MGT-002:** Submissions must include: author's name, contact email, game name, description, instructions, category/type, thumbnail image, and packaged game code.
- **MGT-003:** Submission mechanism should validate adherence to required criteria (presence of required files, basic code checks).
- **MGT-004:** Provide mechanism for submitting updates to existing games.
- **MGT-005:** Updates must follow Semantic Versioning (e.g., 1.0.1, 1.1.0).
- **MGT-006:** Updates must include release notes.
- **MGT-007:** Submissions must undergo evaluation/approval before being made available (automated scans + manual review).
- **MGT-008:** API Gateway shall dynamically discover available games via a service registry database (no hardcoded lists).
- **MGT-009:** Define process for handling game ownership/updates after a student graduates.

### 4.5 Data Analytics & Statistics (API Gateway, Database)
- **DAT-001:** Track website access attempts (timestamp, source IP, success/failure).
- **DAT-002:** Track game play events:
  - Game selected/viewed
  - Game play started
  - Game play ended prematurely
  - Game play completed (include score)
- **DAT-003:** Player identifiers should be consistent but anonymized (hashed MAC/IP or session IDs).
- **DAT-004:** Aggregate and store:
  - Total plays per game
  - Unique players per game
  - Game completions per game
  - Site visits/unique visitors over time
  - Play trends (daily, hourly)
- **DAT-005:** Display relevant game play statistics (e.g., most popular games).
- **DAT-006:** Structure data to support IS student queries and analysis.

---

## 5. Non-Functional Requirements
- **NFR-001 (Maintainability):** Well-documented codebase, consistent standards, TypeScript, linting.
- **NFR-002 (Deployability):** Automated CI/CD (GitHub Actions) building Docker images and deploying across environments (Dev, Test, Staging, Prod).
- **NFR-003 (Reliability):** Health checks for each microservice and logging for monitoring/troubleshooting.
- **NFR-004 (Recoverability):** Support rollback, database backups and restoration procedures.
- **NFR-005 (Scalability):** Microservices can be scaled independently; PostgreSQL supports scaling.
- **NFR-006 (Usability):** Intuitive player interface.
- **NFR-007 (Compatibility):** Support modern browsers: Chrome, Firefox, Safari, Edge.
- **NFR-008 (Responsiveness):** Interface must adapt to desktops, tablets, phones.

---

## 6. Technology Stack Summary
- **Backend:** Node.js (TypeScript), Express.js  
- **Frontend (Web App):** React / Vue.js (to be decided)  
- **Games:** HTML / CSS / JavaScript  
- **Database:** PostgreSQL  
- **Containerization:** Docker, Docker Compose  
- **CI/CD:** GitHub Actions  
- **Testing:** Jest

---

## 7. Fall 2025 Specific Goals (Priorities)
- **(CY) Security Implementation:** Replace email login with IP-based restrictions (CIDR blocks / AWS Security Groups).
- **(CS) Decouple Gateway:** Remove hardcoded game lists; implement dynamic service discovery via the database registry.
- **(CS/IS) Leaderboards:** Implement generic leaderboard functionality (API endpoints, DB schema, frontend).
- **(IS/CS) Enhance Analytics:** Track game completions distinctly from starts; ensure play counts increment correctly across repeated plays by same user.
- **(IT/CS) DevOps Automation:** Add automated regression and smoke tests to CI/CD; set up Testing and Staging environments; expand logging/metrics.
- **(CS) Dynamic Game Addition:** Implement workflow for adding a new game service so it's automatically discovered by the gateway.
- **(CS) Add New Games:** Integrate at least one new game following submission criteria.

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner |  |  |  |
| Lead Developer |  |  |  |
| Scrum Master |  |  |  |








