-- Parts marketplace: hierarchy, attributes, constraints, crushing/screening seeds

ALTER TABLE part_categories
    ADD COLUMN IF NOT EXISTS parent_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_part_category_parent'
    ) THEN
        ALTER TABLE part_categories
            ADD CONSTRAINT fk_part_category_parent
            FOREIGN KEY (parent_id) REFERENCES part_categories(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_part_categories_parent
    ON part_categories(parent_id);

CREATE TABLE IF NOT EXISTS part_attributes (
    id         BIGSERIAL PRIMARY KEY,
    part_id    BIGINT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    name       VARCHAR(120) NOT NULL,
    value      VARCHAR(500) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_part_attributes_part
    ON part_attributes(part_id);

ALTER TABLE parts DROP COLUMN IF EXISTS category;
ALTER TABLE parts DROP COLUMN IF EXISTS sub_category;
ALTER TABLE parts DROP COLUMN IF EXISTS brand;
ALTER TABLE parts DROP COLUMN IF EXISTS manufacturer;
ALTER TABLE parts DROP COLUMN IF EXISTS unit;

CREATE UNIQUE INDEX IF NOT EXISTS uq_parts_sku
    ON parts(sku) WHERE sku IS NOT NULL AND sku <> '';

CREATE UNIQUE INDEX IF NOT EXISTS uq_parts_seo_slug
    ON parts(seo_slug) WHERE seo_slug IS NOT NULL AND seo_slug <> '';

INSERT INTO unit_of_measure (name, symbol, description, active, sort_order)
VALUES
    ('Piece', 'pc', 'Individual unit', TRUE, 10),
    ('Set', 'set', 'Matched set', TRUE, 20),
    ('Kilogram', 'kg', 'Weight', TRUE, 30),
    ('Meter', 'm', 'Length', TRUE, 40),
    ('Pair', 'pr', 'Pair of items', TRUE, 50)
ON CONFLICT (name) DO NOTHING;

INSERT INTO part_categories (name, description, active, sort_order)
VALUES
    ('Wear Parts', 'Liners, jaws, cones, and other wear components', TRUE, 10),
    ('Crushers', 'Crusher components and replacements', TRUE, 20),
    ('Screens', 'Screen media, meshes, and screen parts', TRUE, 30),
    ('Conveyors', 'Belts, idlers, pulleys, and conveyor parts', TRUE, 40),
    ('Hydraulics', 'Pumps, hoses, cylinders, and valves', TRUE, 50),
    ('Electrical', 'Motors, sensors, controllers, and wiring', TRUE, 60),
    ('Filters & Fluids', 'Oil, air, fuel filters and related consumables', TRUE, 70),
    ('Fasteners & Hardware', 'Bolts, wedges, and mounting hardware', TRUE, 80),
    ('Accessories', 'Guards, tools, and other accessories', TRUE, 90)
ON CONFLICT (name) DO NOTHING;

INSERT INTO part_categories (name, description, active, sort_order, parent_id)
SELECT 'Jaw Liners', 'Jaw crusher liners and plates', TRUE, 11, p.id
FROM part_categories p WHERE p.name = 'Wear Parts'
ON CONFLICT (name) DO NOTHING;

INSERT INTO part_categories (name, description, active, sort_order, parent_id)
SELECT 'Cone Liners', 'Cone crusher mantles and concaves', TRUE, 12, p.id
FROM part_categories p WHERE p.name = 'Wear Parts'
ON CONFLICT (name) DO NOTHING;

INSERT INTO part_categories (name, description, active, sort_order, parent_id)
SELECT 'Screen Mesh', 'Woven and polyurethane screen media', TRUE, 31, p.id
FROM part_categories p WHERE p.name = 'Screens'
ON CONFLICT (name) DO NOTHING;

INSERT INTO part_categories (name, description, active, sort_order, parent_id)
SELECT 'Conveyor Belts', 'Belting and splices', TRUE, 41, p.id
FROM part_categories p WHERE p.name = 'Conveyors'
ON CONFLICT (name) DO NOTHING;
