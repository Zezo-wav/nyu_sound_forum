-- NYU Sound Forum Database Schema
-- v3.1: Added is_pinned, last_activity_at, tags support

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'sound_student', 'director', 'producer')),
  bio TEXT,
  year INTEGER,
  profile_picture TEXT,
  specializations TEXT, -- JSON array for sound students
  primary_position TEXT, -- Main position for sound students (e.g., 'Sound Designer')
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  posted_by INTEGER NOT NULL,
  position_needed TEXT NOT NULL,
  project_type TEXT,
  shoot_date DATE,
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'claimed', 'completed', 'archived')),
  claimed_by INTEGER,
  tags TEXT, -- JSON array: ["urgent", "paid", "student_film", "thesis"]
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  claimed_at DATETIME,
  archived_at DATETIME, -- Auto-archive unclaimed requests after X days
  FOREIGN KEY (posted_by) REFERENCES users(id),
  FOREIGN KEY (claimed_by) REFERENCES users(id)
);

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  posted_by INTEGER NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('production_sound', 'post_sound', 'equipment', 'general')),
  is_resolved INTEGER DEFAULT 0,
  is_pinned INTEGER DEFAULT 0, -- NEW in v3.1
  view_count INTEGER DEFAULT 0,
  last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- NEW in v3.1
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id)
);

-- Forum replies table (threaded)
CREATE TABLE IF NOT EXISTS forum_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  parent_reply_id INTEGER, -- NULL for top-level replies
  content TEXT NOT NULL,
  posted_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE,
  FOREIGN KEY (posted_by) REFERENCES users(id)
);

-- Wiki pages table
CREATE TABLE IF NOT EXISTS wiki_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('production', 'post_production', 'equipment', 'general')),
  created_by INTEGER NOT NULL,
  last_edited_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (last_edited_by) REFERENCES users(id)
);

-- Sound Gigs table (sound students posting their own jobs)
CREATE TABLE IF NOT EXISTS gigs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  posted_by INTEGER NOT NULL,
  position_needed TEXT NOT NULL,
  project_type TEXT,
  date_needed DATE,
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'filled', 'completed', 'archived')),
  filled_by INTEGER,
  tags TEXT, -- JSON array: ["urgent", "paid", "student_film", "thesis"]
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  filled_at DATETIME,
  archived_at DATETIME, -- Auto-archive unfilled gigs after X days
  FOREIGN KEY (posted_by) REFERENCES users(id),
  FOREIGN KEY (filled_by) REFERENCES users(id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_position ON requests(position_needed);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_position ON gigs(position_needed);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned ON forum_posts(is_pinned);
CREATE INDEX IF NOT EXISTS idx_forum_posts_activity ON forum_posts(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_slug ON wiki_pages(slug);
