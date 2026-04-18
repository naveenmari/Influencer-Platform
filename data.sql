-- Sample Data Population

USE influencer_platform;

-- Insert Users (Passwords are plain text for demo purposes, in real app use hashes!)
-- Roles: admin, brand, influencer
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@example.com', 'admin123', 'admin'),
('brand_nike', 'contact@nike.com', 'nike123', 'brand'),
('influencer_anna', 'anna@social.com', 'anna123', 'influencer'),
('influencer_john', 'john@tech.com', 'john123', 'influencer');

-- Insert Brand Details
INSERT INTO brands (user_id, company_name, industry, description) VALUES 
((SELECT id FROM users WHERE username='brand_nike'), 'Nike', 'Fashion', 'Just Do It. Leading sports brand.');

-- Insert Influencer Details
-- Insert Influencer Details
INSERT INTO influencers (user_id, category, niche) VALUES 
((SELECT id FROM users WHERE username='influencer_anna'), 'Lifestyle', 'Fashion'),
((SELECT id FROM users WHERE username='influencer_john'), 'Tech', 'Gadgets');

-- Insert Influencer Platforms
INSERT INTO influencer_platforms (influencer_id, platform_name, follower_count) VALUES 
((SELECT id FROM influencers WHERE user_id=(SELECT id FROM users WHERE username='influencer_anna')), 'Instagram', 50000),
((SELECT id FROM influencers WHERE user_id=(SELECT id FROM users WHERE username='influencer_anna')), 'YouTube', 10000),
((SELECT id FROM influencers WHERE user_id=(SELECT id FROM users WHERE username='influencer_john')), 'YouTube', 120000);

-- Insert Campaigns
INSERT INTO campaigns (brand_id, title, description, budget, start_date, end_date, target_platform, visibility, status) VALUES 
((SELECT id FROM brands WHERE company_name='Nike'), 'Summer Run Sale', 'Promoting new running shoes.', 5000.00, '2023-06-01', '2023-08-31', 'Instagram', 'public', 'active');

-- Insert Ad Requests
INSERT INTO ad_requests (campaign_id, influencer_id, message, payment_amount, status) VALUES 
((SELECT id FROM campaigns WHERE title='Summer Run Sale'), (SELECT id FROM influencers WHERE user_id=(SELECT id FROM users WHERE username='influencer_anna')), 'Hey Anna, we love your style! Want to collab?', 500.00, 'pending');
