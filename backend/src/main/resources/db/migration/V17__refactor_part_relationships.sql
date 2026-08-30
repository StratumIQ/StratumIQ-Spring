ALTER TABLE parts
ADD COLUMN IF NOT EXISTS category_id BIGINT;

ALTER TABLE parts
ADD COLUMN IF NOT EXISTS brand_id BIGINT;

ALTER TABLE parts
ADD COLUMN IF NOT EXISTS manufacturer_id BIGINT;

ALTER TABLE parts
ADD COLUMN IF NOT EXISTS unit_of_measure_id BIGINT;

ALTER TABLE parts
ADD COLUMN IF NOT EXISTS sku VARCHAR(100);

ALTER TABLE parts
ADD COLUMN IF NOT EXISTS oem_number VARCHAR(150);

ALTER TABLE parts
ADD COLUMN IF NOT EXISTS warranty VARCHAR(100);

ALTER TABLE parts
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

ALTER TABLE parts
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

ALTER TABLE parts
ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255);

ALTER TABLE parts
ADD COLUMN IF NOT EXISTS length NUMERIC(10,2);

ALTER TABLE parts
ADD COLUMN IF NOT EXISTS width NUMERIC(10,2);

ALTER TABLE parts
ADD COLUMN IF NOT EXISTS height NUMERIC(10,2);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_part_category'
    ) THEN
        ALTER TABLE parts
        ADD CONSTRAINT fk_part_category
        FOREIGN KEY (category_id)
        REFERENCES part_categories(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_part_brand'
    ) THEN
        ALTER TABLE parts
        ADD CONSTRAINT fk_part_brand
        FOREIGN KEY (brand_id)
        REFERENCES part_brands(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_part_manufacturer'
    ) THEN
        ALTER TABLE parts
        ADD CONSTRAINT fk_part_manufacturer
        FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_part_unit'
    ) THEN
        ALTER TABLE parts
        ADD CONSTRAINT fk_part_unit
        FOREIGN KEY (unit_of_measure_id)
        REFERENCES unit_of_measure(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_parts_category
ON parts(category_id);

CREATE INDEX IF NOT EXISTS idx_parts_brand
ON parts(brand_id);

CREATE INDEX IF NOT EXISTS idx_parts_manufacturer
ON parts(manufacturer_id);

CREATE INDEX IF NOT EXISTS idx_parts_unit
ON parts(unit_of_measure_id);