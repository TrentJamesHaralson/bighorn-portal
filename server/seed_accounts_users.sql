-- =====================================================
-- Bighorn Portal Seed Data
-- =====================================================

TRUNCATE TABLE users RESTART IDENTITY CASCADE;
TRUNCATE TABLE corporate_accounts RESTART IDENTITY CASCADE;

INSERT INTO corporate_accounts (id, name, contact_email, created_at) VALUES
('corp-0001', 'Bighorn Boots', NULL, '2025-10-19 07:11:47'),
('corp-0002', 'Bighorn Boot & Work Warehouse', 'ethanfornshell@bhboot.com', '2025-10-22 05:54:56'),
('corp-0003', 'CHS Refinery', 'angela.packard@chsinc.com', '2025-10-22 05:54:56'),
('corp-0004', 'Haralson Consulting', 'trent@haralson-consulting.com', '2025-10-22 05:54:56'),
('corp-0005', 'Par Montana Refinery', 'scali@parpacific.com', '2025-10-22 05:54:56'),
('corp-0006', 'Phillips 66 Refinery', 'jrgustafson@gmail.com', '2025-10-22 05:54:56');

INSERT INTO users (id, account_id, email, password_hash, role, is_active, created_at) VALUES
('user-0001', 'corp-0003', 'angela.packard@chsinc.com', '$2b$10$abcdefghijklmnopqrstuvAdminHash1', 'ADMINISTRATIVE', 1, '2025-10-22 05:54:56'),
('user-0002', 'corp-0005', 'scali@parpacific.com', '$2b$10$abcdefghijklmnopqrstuvAdminHash2', 'ADMINISTRATIVE', 1, '2025-10-22 05:54:56'),
('user-0003', 'corp-0006', 'jrgustafson@gmail.com', '$2b$10$abcdefghijklmnopqrstuvAdminHash3', 'ADMINISTRATIVE', 1, '2025-10-22 05:54:56'),
('user-0004', 'corp-0004', 'trent@haralson-consulting.com', '$2b$10$abcdefghijklmnopqrstuvAdminHash4', 'ADMINISTRATOR', 1, '2025-10-22 05:54:56'),
('user-0005', 'corp-0002', 'ethanfornshell@bhboot.com', '$2b$10$abcdefghijklmnopqrstuvAdminHash5', 'ADMINISTRATOR', 1, '2025-10-22 05:54:56'),
('user-0006', 'corp-0001', 'admin@bighorn.local', '$2b$10$abcdefghijklmnopqrstuvAdminHash6', 'ADMINISTRATOR', 1, '2025-10-19 07:11:47');
