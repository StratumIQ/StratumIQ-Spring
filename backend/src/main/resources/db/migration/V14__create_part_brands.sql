CREATE TABLE part_brands (

    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL UNIQUE,

    description VARCHAR(500),

    active BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);

CREATE INDEX idx_part_brands_active
ON part_brands(active);

CREATE INDEX idx_part_brands_sort
ON part_brands(sort_order);

CREATE INDEX idx_part_brands_name
ON part_brands(name);