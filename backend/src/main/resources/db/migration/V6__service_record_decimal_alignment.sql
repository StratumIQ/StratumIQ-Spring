-- Align service_records numeric columns with ServiceRecord entity

ALTER TABLE service_records
ALTER COLUMN hours_at_service TYPE NUMERIC(10,1)
USING hours_at_service::NUMERIC(10,1);

ALTER TABLE service_records
ALTER COLUMN cost TYPE NUMERIC(12,2)
USING cost::NUMERIC(12,2);

ALTER TABLE service_records
ALTER COLUMN next_service_hours TYPE NUMERIC(10,1)
USING next_service_hours::NUMERIC(10,1);