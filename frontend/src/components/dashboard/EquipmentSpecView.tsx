// FILE PATH: frontend/src/components/dashboard/equipment/EquipmentSpecView.tsx

"use client";

/**
 * EquipmentSpecView — StratumIQ
 * Read-only spec sheet for a single equipment record.
 * Shows all 6 layers in a clean summarised layout.
 */

import Link from "next/link";
import { BRAND, DASH } from "@/lib/constants";
import { useEquipmentSpec } from "./equipment/hooks/useEquipment";
import { Badge, Spinner, TYPE_LABELS, MOBILITY_LABELS } from "./equipment/shared/EqUI";
import type { EquipmentSpec } from "@/types/equipment";

const O = BRAND.orange;

// ── Spec row ──────────────────────────────────────────────────────────────────
function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "" || value === "—") return null;
  return (
    <div style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: `1px solid ${DASH.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: DASH.text3, minWidth: 180, flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 13, color: DASH.text2 }}>{value}</div>
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function ViewCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: DASH.surface, border: `1px solid ${DASH.border}`,
      borderRadius: 14, overflow: "hidden", boxShadow: DASH.shadowSm, marginBottom: 16,
    }}>
      <div style={{
        padding: "13px 18px", borderBottom: `1px solid ${DASH.border}`,
        display: "flex", alignItems: "center", gap: 8,
        background: DASH.surface2,
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: DASH.text }}>{title}</span>
      </div>
      <div style={{ padding: "12px 18px" }}>{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function SpecView({ spec }: { spec: EquipmentSpec }) {
  const eq = spec.identity;
  const t  = spec.technical?.master;
  const c  = spec.commercial?.pricing;
  const lg = spec.operational?.logistics;
  const ev = spec.operational?.environmental;
  const su = spec.intelligence?.suitability;
  const ra = spec.intelligence?.ratings;

  return (
    <div>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${DASH.surface}, ${DASH.surface2})`,
        border: `1px solid ${DASH.border}`, borderRadius: 16,
        padding: "24px 28px", marginBottom: 20,
        boxShadow: DASH.shadowMd,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: DASH.text3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              {TYPE_LABELS[eq.equipment_type]} · {MOBILITY_LABELS[eq.mobility_type]}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: DASH.text, letterSpacing: "-0.03em", marginBottom: 8 }}>
              {eq.brand} {eq.model_name}
              {eq.series && <span style={{ fontSize: 16, fontWeight: 500, color: DASH.text3, marginLeft: 8 }}>{eq.series}</span>}
            </h1>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <Badge label={eq.status} variant={eq.status} />
              {eq.hard_rock_rated && <Badge label="Hard Rock Rated" variant="positive" />}
              <span style={{ fontSize: 12, color: DASH.text3, fontFamily: "monospace" }}>{eq.equipment_id}</span>
            </div>
          </div>

          {/* Key stats */}
          {t && (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {t.capacity_tph_min && t.capacity_tph_max && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: O }}>{t.capacity_tph_min}–{t.capacity_tph_max}</div>
                  <div style={{ fontSize: 10, color: DASH.text3, fontWeight: 600 }}>TPH Capacity</div>
                </div>
              )}
              {t.power_kw && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: O }}>{t.power_kw}</div>
                  <div style={{ fontSize: 10, color: DASH.text3, fontWeight: 600 }}>kW Power</div>
                </div>
              )}
              {t.max_feed_size_mm && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: O }}>{t.max_feed_size_mm}</div>
                  <div style={{ fontSize: 10, color: DASH.text3, fontWeight: 600 }}>mm Max Feed</div>
                </div>
              )}
              {t.weight_kg && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: O }}>{(t.weight_kg / 1000).toFixed(0)}t</div>
                  <div style={{ fontSize: 10, color: DASH.text3, fontWeight: 600 }}>Weight</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left column */}
        <div>
          {/* Technical */}
          {t && (
            <ViewCard title="Technical Specifications" icon="⚙️">
              <SpecRow label="Drive Type"       value={t.drive_type} />
              <SpecRow label="Engine Model"     value={t.engine_model} />
              <SpecRow label="Power (kW)"       value={t.power_kw} />
              <SpecRow label="Weight (kg)"      value={t.weight_kg?.toLocaleString()} />
              <SpecRow label="Max Feed (mm)"    value={t.max_feed_size_mm} />
              <SpecRow label="Capacity (tph)"   value={t.capacity_tph_min && t.capacity_tph_max ? `${t.capacity_tph_min} – ${t.capacity_tph_max}` : undefined} />
              <SpecRow label="Fuel Eff. (L/h)"  value={t.fuel_efficiency_lph} />
              <SpecRow label="Op Cost ($/t)"    value={t.operating_cost_per_ton} />
              <SpecRow label="Wear Cost ($/t)"  value={t.wear_cost_per_ton} />
            </ViewCard>
          )}

          {/* Performance table */}
          {spec.technical?.performance && spec.technical.performance.length > 0 && (
            <ViewCard title="Performance Curves" icon="📈">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {["CSS (mm)", "Capacity (tph)", "Power Draw (kW)", "P80 (mm)", "Notes"].map((h, idx) => (
                        <th key={`perf-header-${idx}`} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: DASH.text3, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${DASH.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {spec.technical.performance.map((r, i) => (
                      <tr key={`perf-row-${i}`} style={{ borderBottom: `1px solid ${DASH.border}` }}>
                        <td style={{ padding: "9px 12px", color: DASH.text, fontWeight: 600 }}>{r.css_mm ?? "—"}</td>
                        <td style={{ padding: "9px 12px", color: DASH.text2 }}>{r.capacity_tph ?? "—"}</td>
                        <td style={{ padding: "9px 12px", color: DASH.text2 }}>{r.power_draw_kw ?? "—"}</td>
                        <td style={{ padding: "9px 12px", color: DASH.text2 }}>{r.product_p80_mm ?? "—"}</td>
                        <td style={{ padding: "9px 12px", color: DASH.text3, fontSize: 12 }}>{r.notes ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ViewCard>
          )}

          {/* Suitability */}
          {su && (
            <ViewCard title="Application Suitability" icon="✅">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[
                  su.hard_rock    && "Hard Rock",
                  su.soft_rock    && "Soft Rock",
                  su.limestone    && "Limestone",
                  su.river_gravel && "River Gravel",
                  su.sand_gravel  && "Sand & Gravel",
                  su.recycling    && "Recycling",
                  su.wet_feed     && "Wet Feed",
                  su.high_moisture && "High Moisture",
                  su.primary_stage   && "Primary Stage",
                  su.secondary_stage && "Secondary Stage",
                  su.tertiary_stage  && "Tertiary Stage",
                ].filter(Boolean).map((label, idx) => (
                  <span key={`suit-${idx}`} style={{
                    padding: "3px 9px", borderRadius: 99,
                    background: "rgba(22,163,74,0.08)", color: "#16A34A",
                    fontSize: 12, fontWeight: 600,
                  }}>{label as string}</span>
                ))}
              </div>
              {(su.abrasiveness_idx_max || su.feed_moisture_max_pct) && (
                <div style={{ marginTop: 10, display: "flex", gap: 16 }}>
                  {su.abrasiveness_idx_max && <SpecRow label="Max Abrasiveness" value={su.abrasiveness_idx_max} />}
                  {su.feed_moisture_max_pct && <SpecRow label="Max Moisture %" value={su.feed_moisture_max_pct} />}
                </div>
              )}
            </ViewCard>
          )}
        </div>

        {/* Right column */}
        <div>
          {/* Commercial */}
          {c && (
            <ViewCard title="Commercial Terms" icon="💼">
              <SpecRow label="Warranty"          value={c.warranty_months ? `${c.warranty_months} months` : undefined} />
              <SpecRow label="Warranty Scope"    value={c.warranty_scope} />
              <SpecRow label="Lead Time"         value={c.lead_time_weeks ? `${c.lead_time_weeks} weeks` : undefined} />
              <SpecRow label="Incoterms"         value={c.incoterms} />
              <SpecRow label="Payment Terms"     value={c.payment_terms} />
              <SpecRow label="Financing"         value={c.financing_available ? "Available" : undefined} />
              <SpecRow label="Rental"            value={c.rental_available    ? "Available" : undefined} />
            </ViewCard>
          )}

          {/* Logistics */}
          {lg && (
            <ViewCard title="Logistics" icon="🚚">
              <SpecRow label="Shipping Mode"       value={lg.shipping_mode} />
              <SpecRow label="Special Permit"      value={lg.requires_special_permit ? "Required" : undefined} />
              <SpecRow label="Crane Req. (t)"      value={lg.crane_capacity_required_t} />
              <SpecRow label="Installation (days)" value={lg.installation_days} />
              <SpecRow label="Commissioning"       value={lg.commissioning_days ? `${lg.commissioning_days} days` : undefined} />
              <SpecRow label="Foundation"          value={lg.foundation_required ? (lg.foundation_type || "Required") : undefined} />
            </ViewCard>
          )}

          {/* Ratings */}
          {ra && ra.overall_score && (
            <ViewCard title="Ratings" icon="⭐">
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: O }}>{ra.overall_score}</div>
                <div style={{ fontSize: 12, color: DASH.text3 }}>Overall Score<br />(out of 5)</div>
              </div>
              <SpecRow label="Fuel Efficiency"       value={ra.fuel_efficiency?.replace(/_/g, " ")} />
              <SpecRow label="Engine"                value={ra.engine_rating?.replace(/_/g, " ")} />
              <SpecRow label="Maintenance"           value={ra.maintenance_simplicity?.replace(/_/g, " ")} />
              <SpecRow label="Reliability"           value={ra.reliability?.replace(/_/g, " ")} />
              <SpecRow label="Parts Availability"    value={ra.parts_availability?.replace(/_/g, " ")} />
              <SpecRow label="TCO"                   value={ra.tco_rating} />
            </ViewCard>
          )}

          {/* Environmental */}
          {ev && (
            <ViewCard title="Environmental" icon="🌿">
              <SpecRow label="Noise (dB)"           value={ev.noise_level_db} />
              <SpecRow label="Dust Class"           value={ev.dust_emission_class} />
              <SpecRow label="CO₂ (g/kWh)"          value={ev.co2_emission_gkwh} />
              <SpecRow label="Recyclable Parts (%)" value={ev.recyclable_parts_pct} />
            </ViewCard>
          )}

          {/* Reviews */}
          {spec.intelligence?.reviews && spec.intelligence.reviews.length > 0 && (
            <ViewCard title={`Operator Reviews (${spec.intelligence.reviews.length})`} icon="💬">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {spec.intelligence.reviews.map((r, idx) => (
                  <div key={`review-${r.review_id || idx}`} style={{ padding: "12px 14px", background: DASH.surface2, borderRadius: 9, border: `1px solid ${DASH.border}` }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= r.rating ? O : DASH.border} stroke="none">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                      {r.site_type && <span style={{ fontSize: 11, color: DASH.text3, marginLeft: 4 }}>{r.site_type}</span>}
                    </div>
                    {r.review_text && <p style={{ fontSize: 13, color: DASH.text2, margin: 0, lineHeight: 1.6 }}>{r.review_text}</p>}
                  </div>
                ))}
              </div>
            </ViewCard>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

export default function EquipmentSpecPage({ equipmentId }: { equipmentId: string }) {
  const { spec, loading, error } = useEquipmentSpec(equipmentId);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <Spinner size={32} />
      </div>
    );
  }
  
  if (error || !spec) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: DASH.red }}>
        {error ?? "Equipment not found"}
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: DASH.text3 }}>
          <Link href="/dashboard/equipment" style={{ textDecoration: "none", color: DASH.text3 }}>Equipment</Link>
          <span>/</span>
          <span style={{ color: DASH.text2 }}>{spec.identity.model_name}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/dashboard/equipment/${equipmentId}/edit`}>
            <button className="btn-primary" style={{ height: 36, padding: "0 16px", fontSize: 13 }}>
              ✏️ Edit Spec
            </button>
          </Link>
        </div>
      </div>
      <SpecView spec={spec} />
    </div>
  );
}