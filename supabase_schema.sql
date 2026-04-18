-- Supabase PostgreSQL Schema

-- Users Table: Stores authentication details and role
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'brand', 'influencer')) NOT NULL,
    profile_pic_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Influencers Table: Specific details for influencers
CREATE TABLE IF NOT EXISTS influencers (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    category VARCHAR(50),
    niche VARCHAR(50),
    bio TEXT,
    verification_status VARCHAR(50) CHECK (verification_status IN ('unverified', 'verified')) DEFAULT 'unverified',
    portfolio_url VARCHAR(255),
    language VARCHAR(50) DEFAULT 'English',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Influencer Platforms
CREATE TABLE IF NOT EXISTS influencer_platforms (
    id SERIAL PRIMARY KEY,
    influencer_id INT NOT NULL,
    platform_name VARCHAR(50) NOT NULL,
    follower_count INT NOT NULL,
    username VARCHAR(100),
    url VARCHAR(255),
    FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE
);

-- Brands Table: Specific details for brands
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(100) NOT NULL,
    industry VARCHAR(50),
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Campaigns Table: Marketing campaigns created by brands
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    brand_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    budget REAL NOT NULL,
    start_date DATE,
    end_date DATE,
    target_platform VARCHAR(50) NOT NULL,
    visibility VARCHAR(50) CHECK (visibility IN ('public', 'private')) DEFAULT 'public',
    status VARCHAR(50) CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
    deliverables TEXT,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
);

-- Ad Requests Table: Links influencers to campaigns
CREATE TABLE IF NOT EXISTS ad_requests (
    id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL,
    influencer_id INT NOT NULL,
    message TEXT,
    requirements TEXT,
    payment_amount REAL,
    status VARCHAR(50) CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE
);

-- Trend Bookmarks Table: Stores saved trends for users
CREATE TABLE IF NOT EXISTS trend_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    keyword VARCHAR(100) NOT NULL,
    platform VARCHAR(50),
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, keyword)
);

-- Influencer Reviews Table: Stores ratings and feedback from brands
CREATE TABLE IF NOT EXISTS influencer_reviews (
    id SERIAL PRIMARY KEY,
    influencer_id INT NOT NULL,
    brand_id INT NOT NULL,
    campaign_id INT,
    rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);

-- Messages Table: Tracks real-time chats
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    campaign_id INT,
    content TEXT NOT NULL,
    read_status VARCHAR(50) CHECK (read_status IN ('unread', 'read')) DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);

-- Content Drafts Table: Content approval workflow
CREATE TABLE IF NOT EXISTS content_drafts (
    id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL,
    influencer_id INT NOT NULL,
    draft_url VARCHAR(255),
    draft_text TEXT,
    status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')) DEFAULT 'pending',
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE
);

-- Brand Reviews Table: Influencers rate Brands
CREATE TABLE IF NOT EXISTS brand_reviews (
    id SERIAL PRIMARY KEY,
    influencer_id INT NOT NULL,
    brand_id INT NOT NULL,
    campaign_id INT,
    rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);
