export interface Game {
  id: number;
  name: string;
  display_name: string;
  description: string;
  instructions: string;
  version: string;
  authors: string;
  category: string;
  thumbnail_url: string | null;
  service_url: string;
  release_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  player_initials: string;
  score: number;
  played_at: string;
}

export interface GameStats {
  name: string;
  display_name: string;
  total_plays: number;
  unique_players: number;
  completions: number;
}

export interface SiteStats {
  total_visits: number;
  unique_visitors: number;
}

export interface AnalyticsData {
  gameStats: GameStats[];
  siteStats: SiteStats;
}

export interface ScoreSubmission {
  initials: string;
  score: number;
}

export interface ScoreResponse {
  success: boolean;
  rank: number;
  isTopTen: boolean;
  score: {
    id: number;
    player_initials: string;
    score: number;
    played_at: string;
  };
}
