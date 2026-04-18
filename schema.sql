-- Create the database
CREATE DATABASE IF NOT EXISTS influencer_platform;
USE influencer_platform;

-- Drop tables if they exist (Order matters due to Foreign Keys)
DROP TABLE IF EXISTS trend_bookmarks;
DROP TABLE IF EXISTS ad_requests;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS influencer_platforms;
DROP TABLE IF EXISTS influencers;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS users;

-- Users Table: Stores authentication details and role
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'brand', 'influencer') NOT NULL,
    profile_pic_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Influencers Table: Specific details for influencers
CREATE TABLE IF NOT EXISTS influencers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    category VARCHAR(50),
    niche VARCHAR(50),
    followers INT DEFAULT 0, -- Keeping as total/legacy or remove? User wants per platform. Let's remove to avoid confusion.
    -- social_platform VARCHAR(50) DEFAULT 'Instagram', -- Removing
    bio TEXT,
    verification_status ENUM('unverified', 'verified') DEFAULT 'unverified',
    portfolio_url VARCHAR(255),
    language VARCHAR(50) DEFAULT 'English',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS influencer_platforms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    influencer_id INT NOT NULL,
    platform_name VARCHAR(50) NOT NULL,
    follower_count INT NOT NULL,
    username VARCHAR(100), -- Added username
    url VARCHAR(255),
    FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE
);

-- Brands Table: Specific details for brands
CREATE TABLE IF NOT EXISTS brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(100) NOT NULL,
    industry VARCHAR(50),
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Campaigns Table: Marketing campaigns created by brands
CREATE TABLE IF NOT EXISTS campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    budget FLOAT NOT NULL,
    start_date DATE,
    end_date DATE,
    target_platform VARCHAR(50) NOT NULL,
    visibility ENUM('public', 'private') DEFAULT 'public',
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    deliverables TEXT,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
);

-- Ad Requests Table: Links influencers to campaigns
CREATE TABLE IF NOT EXISTS ad_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    influencer_id INT NOT NULL,
    message TEXT,
    requirements TEXT,
    payment_amount FLOAT,
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE
);

-- Trend Bookmarks Table: Stores saved trends for users
CREATE TABLE IF NOT EXISTS trend_bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    keyword VARCHAR(100) NOT NULL,
    platform VARCHAR(50),
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY user_keyword (user_id, keyword)
);

-- Influencer Reviews Table: Stores ratings and feedback from brands
CREATE TABLE IF NOT EXISTS influencer_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    campaign_id INT,
    content TEXT NOT NULL,
    read_status ENUM('unread', 'read') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);

-- Content Drafts Table: Content approval workflow
CREATE TABLE IF NOT EXISTS content_drafts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    influencer_id INT NOT NULL,
    draft_url VARCHAR(255),
    draft_text TEXT,
    status ENUM('pending', 'approved', 'rejected', 'revision_requested') DEFAULT 'pending',
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE
);

-- Brand Reviews Table: Influencers rate Brands
CREATE TABLE IF NOT EXISTS brand_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
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

