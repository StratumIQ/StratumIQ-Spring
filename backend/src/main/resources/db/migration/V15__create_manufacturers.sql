CREATE TABLE manufacturers (

    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL UNIQUE,

    description VARCHAR(500),

    active BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);

CREATE INDEX idx_manufacturers_active
ON manufacturers(active);

CREATE INDEX idx_manufacturers_sort
ON manufacturers(sort_order);

CREATE INDEX idx_manufacturers_name
ON manufacturers(name);