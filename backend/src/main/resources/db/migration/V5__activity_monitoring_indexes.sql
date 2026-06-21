CREATE INDEX IF NOT EXISTS idx_activity_logs_action_created
    ON activity_logs(action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_created
    ON activity_logs(entity_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created
    ON activity_logs(user_id, created_at DESC);
