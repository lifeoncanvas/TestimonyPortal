-- Add a role column to identify GRC users and allow future roles
ALTER TABLE users
  ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';

-- Optional index for fast role look‑ups
CREATE INDEX idx_users_role ON users(role);
