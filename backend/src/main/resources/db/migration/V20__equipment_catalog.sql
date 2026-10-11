CREATE TABLE equipment_oems (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    country VARCHAR(100),
    website VARCHAR(500),
    logo_url VARCHAR(2048),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment_catalog (
    id BIGSERIAL PRIMARY KEY,
    equipment_id VARCHAR(64) NOT NULL UNIQUE,
    oem_id BIGINT REFERENCES equipment_oems(id) ON DELETE SET NULL,
    brand VARCHAR(120) NOT NULL,
    series VARCHAR(120),
    model_name VARCHAR(120) NOT NULL,
    equipment_type VARCHAR(40) NOT NULL,
    mobility_type VARCHAR(20) NOT NULL,
    application_stage VARCHAR(120),
    hard_rock_rated BOOLEAN NOT NULL DEFAULT FALSE,
    year_introduced INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_equipment_catalog_type CHECK (equipment_type IN (
        'jaw_crusher', 'cone_crusher', 'hsi_crusher', 'vsi_crusher',
        'gyratory_crusher', 'screen', 'feeder', 'conveyor'
    )),
    CONSTRAINT ck_equipment_catalog_mobility CHECK (mobility_type IN (
        'static', 'track', 'wheel', 'portable', 'modular'
    )),
    CONSTRAINT ck_equipment_catalog_status CHECK (status IN (
        'active', 'discontinued', 'draft'
    )),
    CONSTRAINT ck_equipment_catalog_year CHECK (
        year_introduced IS NULL OR year_introduced BETWEEN 1901 AND 2100
    )
);

CREATE INDEX idx_equipment_catalog_brand ON equipment_catalog(LOWER(brand));
CREATE INDEX idx_equipment_catalog_type ON equipment_catalog(equipment_type);
CREATE INDEX idx_equipment_catalog_mobility ON equipment_catalog(mobility_type);
CREATE INDEX idx_equipment_catalog_oem ON equipment_catalog(oem_id);
CREATE INDEX idx_equipment_catalog_created_at ON equipment_catalog(created_at DESC);