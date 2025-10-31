-- Drop existing data (safe reset)
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
TRUNCATE TABLE accounts RESTART IDENTITY CASCADE;

-- Insert accounts
INSERT INTO accounts (name) VALUES
('CHS Refinery'),
('Par Montana Refinery'),
('P66 Refinery'),
('Haralson Consulting'),
('BigHorn Boot and Work Warehouse');

-- Insert users
INSERT INTO users (email, full_name, role, account_id, is_active, password_hash)
VALUES
('angela.packard@chsinc.com', 'Packard, Angela', 'ADMIN', 1, true, NULL),
('scali@parpacific.com', 'Cali, Sheanna', 'ADMIN', 2, true, NULL),
('jrgustafson@gmail.com', 'Gustafson, Joe', 'ADMIN', 3, true, NULL),
('trent@haralson-consulting.com', 'Haralson, Trent', 'ADMINISTRATOR', 4, true, NULL),
('ethanfornshell@bhboot.com', 'Fornshell, Ethan', 'ADMINISTRATOR', 5, true, NULL);
