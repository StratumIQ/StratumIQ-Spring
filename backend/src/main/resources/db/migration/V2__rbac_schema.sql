-- ── Permissions master list ───────────────────────────────────
CREATE TABLE IF NOT EXISTS permissions (
    id          BIGSERIAL PRIMARY KEY,
    resource    VARCHAR(50)  NOT NULL,
    action      VARCHAR(30)  NOT NULL,
    description VARCHAR(200),
    UNIQUE(resource, action)
);

-- ── Roles ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id          BIGSERIAL PRIMARY KEY,
    tenant_id   BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(200),
    is_custom   BOOLEAN DEFAULT FALSE
);

-- ── Role → Permission mapping ─────────────────────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       BIGINT REFERENCES roles(id)       ON DELETE CASCADE,
    permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ── User → Role mapping ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
    user_id   BIGINT REFERENCES users(id)   ON DELETE CASCADE,
    role_id   BIGINT REFERENCES roles(id)   ON DELETE CASCADE,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ── Seed permissions ──────────────────────────────────────────
INSERT INTO permissions (resource, action, description) VALUES
    ('fleet',       'view',        'View fleet assets'),
    ('fleet',       'create',      'Register new equipment'),
    ('fleet',       'edit',        'Update equipment details'),
    ('fleet',       'delete',      'Remove equipment'),
    ('equipment',   'view',        'View equipment catalog'),
    ('equipment',   'create',      'Add equipment to catalog'),
    ('equipment',   'edit',        'Edit equipment spec'),
    ('equipment',   'delete',      'Remove from catalog'),
    ('maintenance', 'view',        'View maintenance records'),
    ('maintenance', 'create',      'Log maintenance tasks'),
    ('maintenance', 'edit',        'Update maintenance records'),
    ('alerts',      'view',        'View alerts'),
    ('alerts',      'acknowledge', 'Mark alerts as read'),
    ('reports',     'view',        'View reports'),
    ('reports',     'export',      'Export reports'),
    ('users',       'view',        'View team members'),
    ('users',       'create',      'Invite users'),
    ('users',       'edit',        'Edit user details'),
    ('users',       'delete',      'Remove users'),
    ('settings',    'view',        'View settings'),
    ('settings',    'edit',        'Edit settings'),
    ('billing',     'view',        'View billing'),
    ('billing',     'manage',      'Manage billing')
ON CONFLICT (resource, action) DO NOTHING;

-- ── Seed default global roles ─────────────────────────────────
INSERT INTO roles (tenant_id, name, description, is_custom) VALUES
    (NULL, 'SUPER_ADMIN', 'StratumIQ platform owner',     FALSE),
    (NULL, 'ADMIN',       'Full control within tenant',   FALSE),
    (NULL, 'USER',        'Basic configurable access',    FALSE),
    (NULL, 'DEALER',      'Partner/reseller access',      FALSE)
ON CONFLICT DO NOTHING;