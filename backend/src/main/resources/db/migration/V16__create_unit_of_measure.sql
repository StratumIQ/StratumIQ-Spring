CREATE TABLE unit_of_measure (

    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    symbol VARCHAR(20),

    description VARCHAR(500),

    active BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);

CREATE INDEX idx_uom_active
ON unit_of_measure(active);

CREATE INDEX idx_uom_sort
ON unit_of_measure(sort_order);

CREATE INDEX idx_uom_name
ON unit_of_measure(name);