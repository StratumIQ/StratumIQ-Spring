-- ==========================================================
-- PARTS MODULE
-- Initial Marketplace Schema
-- ==========================================================

CREATE TABLE parts (
    id                      BIGSERIAL PRIMARY KEY,

    -- Ownership
    dealer_id               BIGINT NOT NULL,
    created_by              BIGINT NOT NULL,

    -- Basic Information
    part_number             VARCHAR(120) UNIQUE NOT NULL,
    part_name               VARCHAR(255) NOT NULL,
    short_description       VARCHAR(500),
    description             TEXT,

    -- Category
    category                VARCHAR(120),
    sub_category            VARCHAR(120),
    brand                   VARCHAR(120),
    manufacturer            VARCHAR(120),

    -- Pricing
    currency                VARCHAR(10) DEFAULT 'INR',
    price                   NUMERIC(12,2) NOT NULL,
    discount_price          NUMERIC(12,2),

    -- Inventory
    quantity                INTEGER DEFAULT 0,
    unit                    VARCHAR(50),

    -- Product Details
    part_type               VARCHAR(50),
    part_condition          VARCHAR(50),
    weight                  NUMERIC(10,2),

    -- Status
    status                  VARCHAR(50) DEFAULT 'ACTIVE',

    -- SEO
    tags                    TEXT,

    -- Analytics
    total_views             INTEGER DEFAULT 0,
    total_clicks            INTEGER DEFAULT 0,
    total_leads             INTEGER DEFAULT 0,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_parts_dealer
        FOREIGN KEY (dealer_id)
        REFERENCES users(id),

    CONSTRAINT fk_parts_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
);

-- ==========================================================

CREATE TABLE part_images (

    id              BIGSERIAL PRIMARY KEY,

    part_id         BIGINT NOT NULL,

    image_url       TEXT NOT NULL,

    display_order   INTEGER DEFAULT 0,

    is_primary      BOOLEAN DEFAULT FALSE,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_part_images_part
        FOREIGN KEY(part_id)
        REFERENCES parts(id)
        ON DELETE CASCADE
);

-- ==========================================================

CREATE TABLE part_documents (

    id                  BIGSERIAL PRIMARY KEY,

    part_id             BIGINT NOT NULL,

    document_name       VARCHAR(255),

    document_url        TEXT,

    document_type       VARCHAR(50),

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_part_documents_part
        FOREIGN KEY(part_id)
        REFERENCES parts(id)
        ON DELETE CASCADE
);

-- ==========================================================

CREATE INDEX idx_parts_status
ON parts(status);

CREATE INDEX idx_parts_dealer
ON parts(dealer_id);

CREATE INDEX idx_parts_category
ON parts(category);

CREATE INDEX idx_parts_brand
ON parts(brand);

CREATE INDEX idx_part_images_part
ON part_images(part_id);

CREATE INDEX idx_part_documents_part
ON part_documents(part_id);