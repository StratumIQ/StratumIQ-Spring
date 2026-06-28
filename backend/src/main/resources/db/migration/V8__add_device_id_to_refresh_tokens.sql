-- Add device_id column to refresh_tokens table
ALTER TABLE refresh_tokens 
ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);

-- Add index for device_id for better query performance
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_device_id ON refresh_tokens(device_id);

-- Optional: Add comment for documentation
COMMENT ON COLUMN refresh_tokens.device_id IS 'Device identifier for tracking refresh token origins';