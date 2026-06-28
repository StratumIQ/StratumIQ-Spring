-- Add all missing columns to refresh_tokens table based on RefreshToken entity

-- ip_address
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'refresh_tokens' AND column_name = 'ip_address') THEN
        ALTER TABLE refresh_tokens ADD COLUMN ip_address VARCHAR(45);
    END IF;
END $$;

-- user_agent
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'refresh_tokens' AND column_name = 'user_agent') THEN
        ALTER TABLE refresh_tokens ADD COLUMN user_agent VARCHAR(255);
    END IF;
END $$;

-- created_at (if missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'refresh_tokens' AND column_name = 'created_at') THEN
        ALTER TABLE refresh_tokens ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- expires_at (if missing - though we added it in V9)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'refresh_tokens' AND column_name = 'expires_at') THEN
        ALTER TABLE refresh_tokens ADD COLUMN expires_at TIMESTAMP;
    END IF;
END $$;

-- remember_me (if missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'refresh_tokens' AND column_name = 'remember_me') THEN
        ALTER TABLE refresh_tokens ADD COLUMN remember_me BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- is_revoked (if missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'refresh_tokens' AND column_name = 'is_revoked') THEN
        ALTER TABLE refresh_tokens ADD COLUMN is_revoked BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- revoked_at (if missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'refresh_tokens' AND column_name = 'revoked_at') THEN
        ALTER TABLE refresh_tokens ADD COLUMN revoked_at TIMESTAMP;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_ip_address ON refresh_tokens(ip_address);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_created_at ON refresh_tokens(created_at);

-- Add comments for documentation
COMMENT ON COLUMN refresh_tokens.ip_address IS 'IP address of the client that requested the token';
COMMENT ON COLUMN refresh_tokens.user_agent IS 'User agent of the client that requested the token';
COMMENT ON COLUMN refresh_tokens.device_id IS 'Device identifier for tracking refresh token origins';
COMMENT ON COLUMN refresh_tokens.remember_me IS 'Whether this token was issued with Remember Me';
COMMENT ON COLUMN refresh_tokens.is_revoked IS 'Whether this token has been revoked';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'When this token was revoked (if revoked)';