-- Add all missing columns to refresh_tokens table
-- Check and add expires_at column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'refresh_tokens' AND column_name = 'expires_at') THEN
        ALTER TABLE refresh_tokens ADD COLUMN expires_at TIMESTAMP;
    END IF;
END $$;

-- Add remember_me column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'refresh_tokens' AND column_name = 'remember_me') THEN
        ALTER TABLE refresh_tokens ADD COLUMN remember_me BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add is_revoked column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'refresh_tokens' AND column_name = 'is_revoked') THEN
        ALTER TABLE refresh_tokens ADD COLUMN is_revoked BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add revoked_at column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'refresh_tokens' AND column_name = 'revoked_at') THEN
        ALTER TABLE refresh_tokens ADD COLUMN revoked_at TIMESTAMP;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Add comments for documentation
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Expiration timestamp for the refresh token';
COMMENT ON COLUMN refresh_tokens.remember_me IS 'Whether this token was issued with Remember Me';
COMMENT ON COLUMN refresh_tokens.is_revoked IS 'Whether this token has been revoked';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'When this token was revoked (if revoked)';