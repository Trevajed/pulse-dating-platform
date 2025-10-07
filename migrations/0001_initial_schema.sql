-- PULSE Digital Hanky Code Dating Platform
-- Initial Database Schema

-- Users table - Core user profiles
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  bio TEXT,
  pronouns TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT DEFAULT 'US',
  -- Privacy settings
  location_visibility TEXT DEFAULT 'city' CHECK (location_visibility IN ('hidden', 'city', 'state', 'country')),
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('private', 'community', 'public')),
  -- Authentication
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Hanky codes reference table
CREATE TABLE IF NOT EXISTS hanky_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  color TEXT UNIQUE NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('left', 'right')),
  meaning TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'bdsm', 'fetish', 'romantic', 'casual')),
  cultural_context TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User hanky code preferences (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_hanky_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  hanky_code_id INTEGER NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('left', 'right')),
  intensity INTEGER DEFAULT 5 CHECK (intensity BETWEEN 1 AND 10), -- Interest level 1-10
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hanky_code_id) REFERENCES hanky_codes(id),
  UNIQUE(user_id, hanky_code_id)
);

-- User matches and compatibility
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  compatibility_score REAL DEFAULT 0.0, -- 0.0 to 1.0
  match_type TEXT DEFAULT 'algorithm' CHECK (match_type IN ('algorithm', 'mutual_like', 'manual')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  matched_codes TEXT, -- JSON array of matching hanky code IDs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user1_id, user2_id)
);

-- Messages between matched users
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  read_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Safety reports and moderation
CREATE TABLE IF NOT EXISTS safety_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_id INTEGER NOT NULL,
  reported_user_id INTEGER NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('harassment', 'inappropriate_content', 'fake_profile', 'safety_concern', 'other')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  FOREIGN KEY (reporter_id) REFERENCES users(id),
  FOREIGN KEY (reported_user_id) REFERENCES users(id)
);

-- User sessions and authentication tokens
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

CREATE INDEX IF NOT EXISTS idx_user_hanky_codes_user ON user_hanky_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hanky_codes_code ON user_hanky_codes(hanky_code_id);

CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_safety_reports_reporter ON safety_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_safety_reports_reported ON safety_reports(reported_user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);