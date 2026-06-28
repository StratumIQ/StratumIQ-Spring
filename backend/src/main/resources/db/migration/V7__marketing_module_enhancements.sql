-- Marketing module enhancements: unlimited news, status workflow, rich metadata

ALTER TABLE marketing_content
    ADD COLUMN IF NOT EXISTS subtitle      VARCHAR(300),
    ADD COLUMN IF NOT EXISTS rich_content  TEXT,
    ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(2048),
    ADD COLUMN IF NOT EXISTS cta_text      VARCHAR(100),
    ADD COLUMN IF NOT EXISTS status        VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN IF NOT EXISTS is_pinned     BOOLEAN      NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS priority      INT          NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tags          VARCHAR(500),
    ADD COLUMN IF NOT EXISTS created_by    BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS updated_by    BIGINT       REFERENCES users(id) ON DELETE SET NULL;

-- Backfill status from legacy is_active / deleted_at
UPDATE marketing_content
SET status = 'ARCHIVED'
WHERE deleted_at IS NOT NULL AND status = 'DRAFT';

UPDATE marketing_content
SET status = 'PUBLISHED'
WHERE deleted_at IS NULL AND is_active = TRUE AND status = 'DRAFT';

UPDATE marketing_content
SET status = 'DRAFT'
WHERE deleted_at IS NULL AND is_active = FALSE AND status = 'DRAFT';

CREATE INDEX IF NOT EXISTS idx_marketing_content_status
    ON marketing_content(status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_marketing_content_pinned_priority
    ON marketing_content(is_pinned DESC, priority DESC, starts_at DESC NULLS LAST)
    WHERE deleted_at IS NULL AND status = 'PUBLISHED';

CREATE INDEX IF NOT EXISTS idx_marketing_content_created_at
    ON marketing_content(created_at DESC);
