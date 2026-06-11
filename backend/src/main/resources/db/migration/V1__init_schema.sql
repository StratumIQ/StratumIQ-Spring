-- ── Tenants ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    slug       VARCHAR(100) UNIQUE NOT NULL,
    plan       VARCHAR(50)  DEFAULT 'free',
    status     VARCHAR(20)  DEFAULT 'active',
    created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id             BIGSERIAL PRIMARY KEY,
    tenant_id      BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    first_name     VARCHAR(50),
    last_name      VARCHAR(50),
    email          VARCHAR(255) UNIQUE NOT NULL,
    password       VARCHAR(255) NOT NULL,
    phone          VARCHAR(20),
    role           VARCHAR(30)  DEFAULT 'USER',
    account_status VARCHAR(20)  DEFAULT 'pending',
    email_verified BOOLEAN      DEFAULT FALSE,
    phone_verified BOOLEAN      DEFAULT FALSE,
    created_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- ── OTP Verifications ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_verifications (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp_hash   VARCHAR(255) NOT NULL,
    type       VARCHAR(20)  NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Refresh Tokens ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      TEXT   UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Sessions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id   BIGINT       REFERENCES tenants(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) UNIQUE NOT NULL,
    device_info VARCHAR(500),
    ip_address  VARCHAR(45),
    last_active TIMESTAMPTZ  DEFAULT NOW(),
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Equipment (Fleet) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS equipment (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name              VARCHAR(120) NOT NULL,
    category          VARCHAR(50),
    serial_number     VARCHAR(100),
    brand             VARCHAR(100),
    model             VARCHAR(120),
    make_year         INT,
    status            VARCHAR(20)  DEFAULT 'ACTIVE',
    running_hours     NUMERIC(10,1) DEFAULT 0,
    location          VARCHAR(255),
    engine_type       VARCHAR(100),
    power_output      VARCHAR(80),
    capacity          VARCHAR(80),
    application       VARCHAR(120),
    attachments       TEXT,
    image_url         VARCHAR(2048),
    document_url      VARCHAR(2048),
    last_service_date DATE,
    created_at        TIMESTAMPTZ  DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Service Records ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_records (
    id                 BIGSERIAL PRIMARY KEY,
    equipment_id       BIGINT       NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    user_id            BIGINT       NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
    title              VARCHAR(200) NOT NULL,
    service_type       VARCHAR(30),
    status             VARCHAR(20)  DEFAULT 'SCHEDULED',
    description        TEXT,
    technician_name    VARCHAR(120),
    service_date       DATE,
    hours_at_service   NUMERIC(10,1),
    cost               NUMERIC(12,2),
    parts_used         VARCHAR(1000),
    next_service_date  DATE,
    next_service_hours NUMERIC(10,1),
    created_at         TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Equipment Operations ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS equipment_operations (
    id                   BIGSERIAL PRIMARY KEY,
    equipment_id         BIGINT      NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    user_id              BIGINT      NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
    event_type           VARCHAR(30) NOT NULL,
    hours_logged         NUMERIC(10,1),
    total_hours_snapshot NUMERIC(10,1),
    downtime_reason      VARCHAR(500),
    note                 VARCHAR(1000),
    logged_at            TIMESTAMPTZ DEFAULT NOW()
);