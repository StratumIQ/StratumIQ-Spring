-- ==========================================================
-- PART CATEGORIES
-- ==========================================================

CREATE TABLE part_categories (

    id              BIGSERIAL PRIMARY KEY,

    name            VARCHAR(150) NOT NULL UNIQUE,

    description     VARCHAR(500),

    active          BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order      INTEGER NOT NULL DEFAULT 0,

    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_part_categories_active
ON part_categories(active);

CREATE INDEX idx_part_categories_sort
ON part_categories(sort_order);

CREATE INDEX idx_part_categories_name
ON part_categories(name);