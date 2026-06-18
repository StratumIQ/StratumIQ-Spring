-- Dev seed data for admin platform testing
-- Creates a SUPER_ADMIN user if not exists

INSERT INTO tenants (name, slug, plan, status)
SELECT 'StratumIQ Platform', 'stratumiq-platform', 'enterprise', 'active'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'stratumiq-platform');

INSERT INTO users (tenant_id, first_name, last_name, email, password, role, account_status, email_verified, phone_verified)
SELECT t.id, 'Super', 'Admin', 'admin@stratumiq.com',
       '$2a$10$taMjxqOUCwRiIMu8Qf8o.O.5MNOyfgQe7E8mi3OgqgsEZ2NUBXdh6',
       'SUPER_ADMIN', 'ACTIVE', TRUE, TRUE
FROM tenants t
WHERE t.slug = 'stratumiq-platform'
AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@stratumiq.com');

-- Default password: Admin@123456

INSERT INTO activity_logs (tenant_id, user_id, actor_id, action, entity_type, metadata)
SELECT t.id, u.id, u.id, 'PLATFORM_INITIALIZED', 'SYSTEM',
       '{"message": "Admin platform seed data applied"}'::jsonb
FROM tenants t
JOIN users u ON u.email = 'admin@stratumiq.com'
WHERE NOT EXISTS (
    SELECT 1 FROM activity_logs WHERE action = 'PLATFORM_INITIALIZED'
);

INSERT INTO support_tickets (ticket_number, user_id, tenant_id, subject, description, status, priority, created_by)
SELECT 'TKT-2026-00001', u.id, u.tenant_id,
       'Sample support request', 'Equipment dashboard not loading for fleet owner.',
       'OPEN', 'HIGH', a.id
FROM users u
CROSS JOIN users a
WHERE u.role = 'USER'
AND a.email = 'admin@stratumiq.com'
AND NOT EXISTS (SELECT 1 FROM support_tickets WHERE ticket_number = 'TKT-2026-00001')
ORDER BY u.id
LIMIT 1;
