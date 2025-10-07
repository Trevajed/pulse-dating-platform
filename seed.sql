-- PULSE Digital Hanky Code Dating Platform
-- Seed Data with Cultural Authenticity

-- Insert core hanky code meanings (culturally authentic)
INSERT OR IGNORE INTO hanky_codes (color, position, meaning, description, category, cultural_context) VALUES 

-- Classic BDSM/Leather Community Codes
('red', 'left', 'Fisting Top', 'Active in fisting play', 'bdsm', 'Original leather community signal from 1970s San Francisco'),
('red', 'right', 'Fisting Bottom', 'Receptive to fisting play', 'bdsm', 'Original leather community signal from 1970s San Francisco'),

('black', 'left', 'Heavy S&M Top', 'Dominant in intense S&M scenes', 'bdsm', 'Core leather community identifier'),
('black', 'right', 'Heavy S&M Bottom', 'Submissive in intense S&M scenes', 'bdsm', 'Core leather community identifier'),

('blue', 'left', 'Oral Top', 'Prefers giving oral pleasure', 'general', 'One of the most recognized codes'),
('blue', 'right', 'Oral Bottom', 'Prefers receiving oral pleasure', 'general', 'One of the most recognized codes'),

('yellow', 'left', 'Watersports Top', 'Active in watersports play', 'fetish', 'Established fetish community signal'),
('yellow', 'right', 'Watersports Bottom', 'Receptive to watersports play', 'fetish', 'Established fetish community signal'),

-- Additional Authentic Colors
('grey', 'left', 'Bondage Top', 'Enjoys tying up partners', 'bdsm', 'Classic restraint play indicator'),
('grey', 'right', 'Bondage Bottom', 'Enjoys being tied up', 'bdsm', 'Classic restraint play indicator'),

('orange', 'left', 'Anything Goes Top', 'Open to various activities as top', 'general', 'Versatility indicator'),
('orange', 'right', 'Anything Goes Bottom', 'Open to various activities as bottom', 'general', 'Versatility indicator'),

('white', 'left', 'Masturbation', 'Enjoys mutual masturbation', 'general', 'Softer intimate activity'),
('white', 'right', 'Masturbation', 'Enjoys mutual masturbation', 'general', 'Softer intimate activity'),

('brown', 'left', 'Scat Top', 'Active in scat play', 'fetish', 'Specialized fetish community'),
('brown', 'right', 'Scat Bottom', 'Receptive to scat play', 'fetish', 'Specialized fetish community'),

-- Romantic/Relationship Codes (Modern Additions)
('pink', 'left', 'Romantic Top', 'Seeks romantic connection with dominance', 'romantic', 'Modern adaptation for relationship-focused individuals'),
('pink', 'right', 'Romantic Bottom', 'Seeks romantic connection with submission', 'romantic', 'Modern adaptation for relationship-focused individuals'),

('green', 'left', 'Hustler/Trade', 'Professional or transactional', 'general', 'Historical economic indicator'),
('green', 'right', 'Buyer', 'Interested in professional services', 'general', 'Historical economic indicator'),

('purple', 'left', 'Piercing Top', 'Into piercing play', 'fetish', 'Body modification community'),
('purple', 'right', 'Piercing Bottom', 'Enjoys receiving piercings', 'fetish', 'Body modification community'),

-- Casual/Social Codes
('light blue', 'left', 'Oral Sex, 69', 'Mutual oral pleasure', 'casual', 'Reciprocal intimacy'),
('light blue', 'right', 'Oral Sex, 69', 'Mutual oral pleasure', 'casual', 'Reciprocal intimacy'),

('maroon', 'left', 'Cut', 'Prefers circumcised partners', 'general', 'Physical preference indicator'),
('maroon', 'right', 'Uncut', 'Prefers uncircumcised partners', 'general', 'Physical preference indicator');

-- Insert demo users (for development/testing)
INSERT OR IGNORE INTO users (email, username, display_name, age, bio, pronouns, location_city, location_state, password_hash) VALUES 
('alex@example.com', 'alex_leather', 'Alex', 28, 'New to the scene, looking to learn and connect with experienced community members. Into leather culture and interested in exploring BDSM dynamics safely.', 'he/him', 'San Francisco', 'CA', '$2b$12$dummy_hash_for_development'),

('sam@example.com', 'sam_switch', 'Sam', 32, 'Experienced switch looking for meaningful connections. Love the history and culture behind hanky codes. Always happy to help newcomers learn.', 'they/them', 'New York', 'NY', '$2b$12$dummy_hash_for_development'),

('jordan@example.com', 'jordan_explorer', 'Jordan', 25, 'Curious explorer interested in the cultural significance of hanky codes. Looking for friends and possibly more with patient, understanding people.', 'she/her', 'Chicago', 'IL', '$2b$12$dummy_hash_for_development'),

('river@example.com', 'river_community', 'River', 35, 'Long-time community member and leather history enthusiast. Enjoy mentoring and building authentic connections within our diverse community.', 'he/they', 'Los Angeles', 'CA', '$2b$12$dummy_hash_for_development');

-- Insert user hanky code preferences (realistic combinations)
INSERT OR IGNORE INTO user_hanky_codes (user_id, hanky_code_id, position, intensity) VALUES 
-- Alex (new to scene, conservative choices)
(1, (SELECT id FROM hanky_codes WHERE color = 'blue' AND position = 'right'), 'right', 7),
(1, (SELECT id FROM hanky_codes WHERE color = 'grey' AND position = 'right'), 'right', 5),
(1, (SELECT id FROM hanky_codes WHERE color = 'pink' AND position = 'right'), 'right', 8),

-- Sam (experienced switch)
(2, (SELECT id FROM hanky_codes WHERE color = 'black' AND position = 'left'), 'left', 8),
(2, (SELECT id FROM hanky_codes WHERE color = 'black' AND position = 'right'), 'right', 8),
(2, (SELECT id FROM hanky_codes WHERE color = 'blue' AND position = 'left'), 'left', 9),
(2, (SELECT id FROM hanky_codes WHERE color = 'orange' AND position = 'left'), 'left', 7),

-- Jordan (curious explorer)
(3, (SELECT id FROM hanky_codes WHERE color = 'white' AND position = 'right'), 'right', 6),
(3, (SELECT id FROM hanky_codes WHERE color = 'pink' AND position = 'right'), 'right', 9),
(3, (SELECT id FROM hanky_codes WHERE color = 'light blue' AND position = 'right'), 'right', 7),

-- River (experienced community member)
(4, (SELECT id FROM hanky_codes WHERE color = 'red' AND position = 'left'), 'left', 9),
(4, (SELECT id FROM hanky_codes WHERE color = 'grey' AND position = 'left'), 'left', 8),
(4, (SELECT id FROM hanky_codes WHERE color = 'purple' AND position = 'left'), 'left', 6),
(4, (SELECT id FROM hanky_codes WHERE color = 'pink' AND position = 'left'), 'left', 8);

-- Create some initial matches based on compatibility
INSERT OR IGNORE INTO matches (user1_id, user2_id, compatibility_score, match_type, status, matched_codes) VALUES 
(1, 2, 0.75, 'algorithm', 'pending', '[2,4,18]'), -- Alex & Sam (grey, blue, pink compatibility)
(3, 4, 0.65, 'algorithm', 'accepted', '[18]'), -- Jordan & River (pink compatibility)
(1, 4, 0.55, 'algorithm', 'pending', '[4,18]'); -- Alex & River (grey, pink compatibility)

-- Add sample messages
INSERT OR IGNORE INTO messages (match_id, sender_id, content, message_type) VALUES 
(2, 3, 'Hi River! I love your profile - you seem like someone who really understands the cultural significance behind all this. Would love to chat more!', 'text'),
(2, 4, 'Thank you Jordan! I appreciate your thoughtful approach. The history and meaning behind hanky codes is so important to preserve. How did you first learn about them?', 'text'),
(2, 3, 'I actually discovered them through a queer history class in college. The professor mentioned them briefly and I was fascinated by this whole coded communication system our community developed.', 'text');