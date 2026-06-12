/**
 * Fleet Types — StratumIQ
 * Path: frontend/src/types/fleet.ts
 *
 * All field names mirror the DB column names returned by the Spring backend.
 * Enum values must match Java enum names exactly (UPPER_CASE).
 */

// ── Enums (must match Java enums in backend/common/enums/) ───────────────────
export type EquipmentStatus   = "ACTIVE" | "IDLE" | "MAINTENANCE" | "RETIRED";
export type EquipmentCategory = "CRUSHER" | "SCREENER" | "CONVEYOR" | "MOBILE_PLANT" | "OTHER";
export type ServiceType       = "PREVENTIVE" | "CORRECTIVE" | "INSPECTION";
export type ServiceStatus     = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
export type OperationEventType = "HOURS_UPDATE" | "DOWNTIME" | "NOTE";

// ── Equipment (matches FleetEquipment entity) ─────────────────────────────────
export type FleetEquipment = {
  id:                number;
  user_id:           number;
  name:              string;
  category:          EquipmentCategory;
  serial_number:     string | null;
  brand:             string | null;
  model:             string | null;
  make_year:         number | null;
  status:            EquipmentStatus;
  running_hours:     string;        // NUMERIC comes back as string
  location:          string | null;
  last_service_date: string | null;
  engine_type:       string | null;
  power_output:      string | null;
  capacity:          string | null;
  application:       string | null;
  attachments:       string | null;
  image_url:         string | null;
  document_url:      string | null;
  created_at:        string;
  updated_at:        string;
  // computed by service
  service_count:     string;
  overdue_count?:    string;
};

// ── Fleet summary (GET /api/fleet/summary) ────────────────────────────────────
export type FleetSummary = {
  total:                  string;
  active:                 string;
  idle:                   string;
  maintenance:            string;
  retired:                string;
  avg_running_hours:      string | null;
  service_overdue_count:  string;
};

// ── Pagination wrapper (GET /api/fleet) ───────────────────────────────────────
export type FleetListResponse = {
  equipment:  FleetEquipment[];
  pagination: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
  };
};

// ── Service record ────────────────────────────────────────────────────────────
export type ServiceRecord = {
  id:                 number;
  equipment_id:       number;
  user_id:            number;
  title:              string;
  service_type:       ServiceType;
  status:             ServiceStatus;
  description:        string | null;
  technician_name:    string | null;
  service_date:       string | null;
  hours_at_service:   string | null;
  cost:               string | null;
  parts_used:         string | null;
  next_service_date:  string | null;
  next_service_hours: string | null;
  created_at:         string;
  updated_at:         string;
};

// ── Operation event ───────────────────────────────────────────────────────────
export type OperationLog = {
  id:                    number;
  equipment_id:          number;
  user_id:               number;
  event_type:            OperationEventType;
  hours_logged:          string | null;
  total_hours_snapshot:  string | null;
  downtime_reason:       string | null;
  note:                  string | null;
  logged_at:             string;
};

// ── API request payloads ──────────────────────────────────────────────────────
export type CreateEquipmentPayload = {
  name:           string;
  category:       EquipmentCategory;
  serial_number?: string;
  brand?:         string;
  model?:         string;
  make_year?:     number;
  status?:        EquipmentStatus;
  running_hours?: number;
  location?:      string;
  engine_type?:   string;
  power_output?:  string;
  capacity?:      string;
  application?:   string;
  attachments?:   string;
  image_url?:     string;
  document_url?:  string;
};

export type UpdateEquipmentPayload = Partial<CreateEquipmentPayload>;

export type UpdateStatusPayload = { status: EquipmentStatus };

export type UpdateHoursPayload = { running_hours: number; note?: string };

export type ListEquipmentParams = {
  status?:   EquipmentStatus | "all";
  category?: EquipmentCategory | "all";
  search?:   string;
  page?:     number;
  limit?:    number;
  sort?:     "created_at" | "name" | "running_hours" | "last_service_date";
  order?:    "asc" | "desc";
};

export type CreateServiceRecordPayload = {
  title:               string;
  service_type:        ServiceType;
  status?:             ServiceStatus;
  description?:        string;
  technician_name?:    string;
  service_date?:       string;
  hours_at_service?:   number;
  cost?:               number;
  parts_used?:         string;
  next_service_date?:  string;
  next_service_hours?: number;
};

export type UpdateServiceRecordPayload = Partial<CreateServiceRecordPayload>;

export type LogOperationPayload =
  | { event_type: "HOURS_UPDATE"; hours_logged: number; note?: string }
  | { event_type: "DOWNTIME";     downtime_reason: string; note?: string }
  | { event_type: "NOTE";         note: string };