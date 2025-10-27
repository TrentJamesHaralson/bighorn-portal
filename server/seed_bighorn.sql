-- =====================================================
-- Bighorn Portal Seed Data
-- Safe to run multiple times (clears before insert)
-- =====================================================

-- 1. Clear existing data
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
TRUNCATE TABLE corporate_accounts RESTART IDENTITY CASCADE;

-- 2. Insert corporate accounts
INSERT INTO corporate_accounts (name, email, created_at) VALUES
('Bighorn Boots', NULL, '2025-10-19 07:11:47'),
('Bighorn Boot & Work Warehouse', 'ethanfornshell@bhboot.com', '2025-10-22 05:54:56'),
('CHS Refinery', 'angela.packard@chsinc.com', '2025-10-22 05:54:56'),
('Haralson Consulting', 'trent@haralson-consulting.com', '2025-10-22 05:54:56'),
('Par Montana Refinery', 'scali@parpacific.com', '2025-10-22 05:54:56'),
('Phillips 66 Refinery', 'jrgustafson@gmail.com', '2025-10-22 05:54:56');

-- 3. Insert users
INSERT INTO users (email, role, active, created_at) VALUES
('angela.packard@chsinc.com', 'ADMINISTRATIVE', TRUE, '2025-10-22 05:54:56'),
('scali@parpacific.com', 'ADMINISTRATIVE', TRUE, '2025-10-22 05:54:56'),
('jrgustafson@gmail.com', 'ADMINISTRATIVE', TRUE, '2025-10-22 05:54:56'),
('trent@haralson-consulting.com', 'ADMINISTRATOR', TRUE, '2025-10-22 05:54:56'),
('ethanfornshell@bhboot.com', 'ADMINISTRATOR', TRUE, '2025-10-22 05:54:56'),
('admin@bighorn.local', 'ADMINISTRATOR', TRUE, '2025-10-19 07:11:47');

-- =====================================================
-- End of Bighorn Portal Seed Script
-- =====================================================
