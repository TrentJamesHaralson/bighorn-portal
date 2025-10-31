INSERT INTO users (email, password_hash, role, is_active, first_name, last_name)
VALUES (
  'admin@bighorn.local',
  '',
  'ADMINISTRATOR',
  true,
  'Portal',
  'Admin'
)
ON CONFLICT (email) DO NOTHING;
