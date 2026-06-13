-- ── Users audit columns ───────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- ── Support tickets ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
    id            BIGSERIAL PRIMARY KEY,
    ticket_number VARCHAR(20)  UNIQUE NOT NULL,
    user_id       BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id     BIGINT       REFERENCES tenants(id) ON DELETE SET NULL,
    subject       VARCHAR(200) NOT NULL,
    description   TEXT,
    status        VARCHAR(30)  NOT NULL DEFAULT 'OPEN',
    priority      VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    assigned_to   BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    created_by    BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    resolved_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_active ON support_tickets(deleted_at) WHERE deleted_at IS NULL;

-- ── Support ticket notes ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_ticket_notes (
    id          BIGSERIAL PRIMARY KEY,
    ticket_id   BIGINT       NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    author_id   BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body        TEXT         NOT NULL,
    is_internal BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_notes_ticket ON support_ticket_notes(ticket_id);

-- ── Activity logs (platform audit trail) ────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
    id          BIGSERIAL PRIMARY KEY,
    tenant_id   BIGINT       REFERENCES tenants(id) ON DELETE SET NULL,
    user_id     BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    actor_id    BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(80)  NOT NULL,
    entity_type VARCHAR(50),
    entity_id   BIGINT,
    metadata    JSONB,
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant ON activity_logs(tenant_id, created_at DESC);

-- ── Lead candidates (Phase 2 ready) ───────────────────────────
CREATE TABLE IF NOT EXISTS lead_candidates (
    id            BIGSERIAL PRIMARY KEY,
    tenant_id     BIGINT       REFERENCES tenants(id) ON DELETE SET NULL,
    email         VARCHAR(255) NOT NULL,
    company_name  VARCHAR(200),
    source        VARCHAR(80),
    status        VARCHAR(30)  DEFAULT 'NEW',
    metadata      JSONB,
    created_at    TIMESTAMPTZ  DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_lead_candidates_status ON lead_candidates(status);

-- ── Marketing content (Phase 2 ready) ───────────────────────────
CREATE TABLE IF NOT EXISTS marketing_content (
    id          BIGSERIAL PRIMARY KEY,
    tenant_id   BIGINT       REFERENCES tenants(id) ON DELETE SET NULL,
    type        VARCHAR(30)  NOT NULL,
    title       VARCHAR(200) NOT NULL,
    body        TEXT,
    image_url   VARCHAR(2048),
    cta_url     VARCHAR(2048),
    is_active   BOOLEAN      DEFAULT FALSE,
    starts_at   TIMESTAMPTZ,
    ends_at     TIMESTAMPTZ,
    sort_order  INT          DEFAULT 0,
    created_at  TIMESTAMPTZ  DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_marketing_content_type ON marketing_content(type);
CREATE INDEX IF NOT EXISTS idx_marketing_content_active ON marketing_content(is_active) WHERE deleted_at IS NULL;

-- ── Equipment indexes for admin queries ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_equipment_user_id ON equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_created_at ON equipment(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_equipment_ops_logged_at ON equipment_operations(logged_at DESC);
