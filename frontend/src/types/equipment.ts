
// ── A. IDENTITY ───────────────────────────────────────────────────────────────

export type EquipmentType =
  | "jaw_crusher" | "cone_crusher" | "hsi_crusher" | "vsi_crusher"
  | "gyratory_crusher" | "screen" | "feeder" | "conveyor";

export type MobilityType = "static" | "track" | "wheel" | "portable" | "modular";
export type EquipmentStatus = "active" | "discontinued" | "draft";

export interface OEM {
  oem_id:     number;   // alias: DB column is `id`, joined as oem_id
  name:       string;
  country?:   string;
  website?:   string;
  logo_url?:  string;
  created_at: string;
}

export interface Equipment {
  equipment_id:      string;
  oem_id?:           number;
  brand:             string;
  series?:           string;
  model_name:        string;
  equipment_type:    EquipmentType;
  mobility_type:     MobilityType;
  application_stage?: string;
  hard_rock_rated?:  boolean;
  year_introduced?:  number;
  status:            EquipmentStatus;
  created_at:        string;
}

export interface EquipmentListItem extends Equipment {
  oem_name?: string;
}

export interface EquipmentListResponse {
  data:  EquipmentListItem[];   // backend returns `data` not `equipment`
  total: number;
  page:  number;
  pages: number;               // backend returns `pages` not `totalPages`
  limit: number;
}

export interface EquipmentSpec {
  identity:      Equipment;
  technical?: {
    master:         TechnicalMaster | null;
    type_specs:     Record<string, unknown> | null;
    mobility_specs: Record<string, unknown> | null;
    performance:    PerformanceRow[];
    wear_parts:     WearPart[];
    maintenance:    MaintenanceTask[];
  };
  commercial?: {
    pricing:  Commercial | null;   // commercial terms row
    dealers:  Dealer[];
    market:   PricingRecord[];     // pricing_intelligence rows
  };
  operational?: {
    logistics:      Logistics | null;
    certifications: Certification[];
    environmental:  Environmental | null;
  };
  intelligence?: {
    benchmarks:  Benchmark[];
    suitability: Suitability | null;
    ratings:     Ratings | null;
    reviews:     Review[];
  };
  media?: Media[];
  _meta?: {
    type_table:     string | null;
    mobility_table: string | null;
  };
}

// ── B. TECHNICAL ─────────────────────────────────────────────────────────────

export interface TechnicalMaster {
  equipment_id:           string;
  weight_kg?:             number;
  power_kw?:              number;
  drive_type?:            "diesel" | "electric" | "diesel-electric";
  engine_model?:          string;
  fuel_efficiency_lph?:   number;
  max_feed_size_mm?:      number;
  capacity_tph_min?:      number;
  capacity_tph_max?:      number;
  operating_cost_per_ton?: number;
  wear_cost_per_ton?:     number;
}

export interface PerformanceRow {
  id:               number;   // DB primary key
  equipment_id:     string;
  feed_size_mm?:    number;   // backend field name
  css_mm?:          number;
  capacity_tph_min?: number;  // backend field name
  capacity_tph_max?: number;  // backend field name
  reduction_ratio?: number;   // backend field name
  power_draw_kw?:   number;
  notes?:           string;
}

export interface WearPart {
  id:                   number;   // DB primary key (NOT part_id)
  equipment_id:         string;
  part_name:            string;
  part_number?:         string;
  material?:            string;
  weight_kg?:           number;
  expected_life_hours?: number;   // DB column (NOT life_hours)
  unit_cost_usd?:       number;   // DB column (NOT cost_usd)
  oem_compatible?:      boolean;  // DB column
  notes?:               string;
}

export interface MaintenanceTask {
  id:               number;   // DB primary key (NOT task_id)
  equipment_id:     string;
  task_name:        string;
  interval_hours?:  number;
  interval_days?:   number;
  duration_hours?:  number;   // DB column (NOT estimated_hours)
  skill_level?:     "operator" | "technician" | "specialist";  // DB column (NOT technician_level)
  parts_required?:  string;
  notes?:           string;
}

// ── C. COMMERCIAL ─────────────────────────────────────────────────────────────

export interface Commercial {
  equipment_id:          string;
  base_price_usd?:       number;   // DB column
  price_range_min_usd?:  number;   // DB column
  price_range_max_usd?:  number;   // DB column
  currency?:             string;   // DB column (default "USD")
  incoterms?:            "EXW" | "FOB" | "CIF" | "DAP" | "DDP";
  lead_time_weeks?:      number;
  warranty_months?:      number;
  financing_available?:  boolean;
  rental_available?:     boolean;
  notes?:                string;
}

export interface Dealer {
  id:                number;   // DB primary key (NOT dealer_id)
  equipment_id:      string;
  dealer_name:       string;   // DB column (NOT company_name)
  country:           string;   // REQUIRED in backend schema
  city?:             string;
  contact_email?:    string;
  contact_phone?:    string;
  is_authorized?:    boolean;
  is_service_center?: boolean;
}

export interface PricingRecord {
  id:                number;   // DB primary key (NOT price_id)
  equipment_id:      string;
  region:            string;
  market_price_usd?: number;
  price_date?:       string;
  source?:           string;
  notes?:            string;
}

// ── D. OPERATIONAL ───────────────────────────────────────────────────────────

export interface Logistics {
  equipment_id:              string;
  shipping_mode?:            "road" | "rail" | "sea" | "air" | "multimodal";
  requires_special_permit?:  boolean;
  crane_capacity_required_t?: number;
  installation_days?:        number;
  commissioning_days?:       number;
  foundation_required?:      boolean;
  foundation_type?:          string;
  notes?:                    string;
}

export interface Certification {
  id:                 number;   // DB primary key
  equipment_id:       string;
  standard_name:      string;
  certification_body?: string;
  certificate_number?: string;
  valid_from?:        string;
  valid_until?:       string;
  region?:            string;
  document_url?:      string;
}

export interface Environmental {
  equipment_id:         string;
  noise_level_db?:      number;
  dust_emission_class?: string;
  fuel_consumption_lph?: number;
  co2_emission_gkwh?:   number;
  vibration_class?:     string;
  water_usage_lph?:     number;
  recyclable_parts_pct?: number;
  notes?:               string;
}

// ── E. INTELLIGENCE ──────────────────────────────────────────────────────────

export interface Benchmark {
  id:                number;   // DB primary key
  equipment_id:      string;
  competitor_model:  string;
  parameter:         string;
  our_value?:        number;
  competitor_value?: number;
  unit?:             string;
  advantage?:        "positive" | "negative" | "neutral";
  notes?:            string;
}

export interface Suitability {
  equipment_id:          string;
  hard_rock?:            boolean;
  soft_rock?:            boolean;
  recycling?:            boolean;
  limestone?:            boolean;
  river_gravel?:         boolean;
  sand_gravel?:          boolean;
  wet_feed?:             boolean;
  high_moisture?:        boolean;
  primary_stage?:        boolean;
  secondary_stage?:      boolean;
  tertiary_stage?:       boolean;
  abrasiveness_idx_max?: number;
  feed_moisture_max_pct?: number;
  notes?:                string;
}

export type RatingLabel = "poor" | "fair" | "good" | "very_good" | "excellent";
export type TCOLabel    = "economical" | "fair" | "good" | "premium";

export interface Ratings {
  equipment_id:           string;
  fuel_efficiency?:        RatingLabel;
  engine_rating?:          RatingLabel;
  maintenance_simplicity?: RatingLabel;
  reliability?:            RatingLabel;
  parts_availability?:     RatingLabel;
  tco_rating?:             TCOLabel;
  overall_score?:          number;
}

export interface Review {
  id:                 number;   // DB primary key
  equipment_id:       string;
  user_id?:           number;
  rating:             number;
  review_text?:       string;
  operational_hours?: number;
  site_type?:         string;
  site_location?:     string;
  created_at:         string;
}

// ── F. MEDIA ─────────────────────────────────────────────────────────────────

export type MediaType = "brochure" | "image" | "cad" | "manual" | "video" | "spec_sheet";

export interface Media {
  id:               number;   // DB primary key
  equipment_id:     string;
  media_type:       MediaType;
  file_name:        string;
  file_url:         string;
  file_size_bytes?: number;
  language?:        string;
  version?:         string;
  is_primary?:      boolean;
  description?:     string;
  uploaded_by?:     number;
  created_at:       string;
}

// ── Query / Filter ─────────────────────────────────────────────────────────────

export interface EquipmentListQuery {
  brand?:          string;
  equipment_type?: EquipmentType;
  mobility_type?:  MobilityType;
  oem_id?:         number;
  search?:         string;
  page?:           number;
  limit?:          number;
}

