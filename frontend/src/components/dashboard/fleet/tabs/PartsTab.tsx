/**
 * PartsTab — StratumIQ
 * Path: frontend/src/components/dashboard/fleet/tabs/PartsTab.tsx
 *
 * Parts & Manuals tab for FleetDetail.
 * Links to Aftermarket module with context (asset ID passed).
 * Matches PDF §4.4 — Parts & Manuals section.
 */

"use client";

import { useRouter } from "next/navigation";
import {
  Wrench, Settings, Droplets, Link2, Zap, Package,
  BookOpen, FileText, HelpCircle, Lightbulb, Search, ChevronRight, Download,
} from "lucide-react";
import { DASH, BRAND } from "@/lib/constants";
import type { FleetEquipment } from "@/types/fleet";

interface PartsTabProps {
  equipment: FleetEquipment;
}

export default function PartsTab({ equipment }: PartsTabProps) {
  const router = useRouter();

  const handleFindParts = () => {
    // Pass equipment ID and name as query params to Aftermarket
    router.push(`/dashboard/parts?equipmentId=${equipment.id}&equipmentName=${encodeURIComponent(equipment.name)}`);
  };

  const handleRequestManual = () => {
    // Open contact form or support ticket with pre-filled equipment context
    router.push(`/dashboard/support?type=manual&equipmentId=${equipment.id}&equipmentName=${encodeURIComponent(equipment.name)}`);
  };

  const handleViewPartsCatalog = () => {
    router.push("/dashboard/parts");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* Parts Catalog Section */}
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: DASH.text,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Package size={18} color={BRAND.orange} />
          Parts Catalog
        </div>
        <div
          style={{
            background: DASH.surface2,
            borderRadius: 12,
            padding: "20px",
            border: `1px solid ${DASH.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: DASH.text,
                  marginBottom: 4,
                }}
              >
                Find parts for {equipment.name}
              </div>
              <div style={{ fontSize: 12, color: DASH.text3 }}>
                Browse genuine parts, filters, wear parts, and components
              </div>
            </div>
            <button onClick={handleFindParts} className="btn-primary">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              Find Parts
            </button>
          </div>
        </div>
      </div>

      {/* Quick Parts Categories */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: DASH.text2,
            marginBottom: 12,
          }}
        >
          Common Parts for {equipment.brand || "This"} {equipment.category}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 10,
          }}
        >
          {[
            { name: "Filters", Icon: Wrench, count: "12 variants" },
            { name: "Wear Parts", Icon: Settings, count: "8 variants" },
            { name: "Hydraulics", Icon: Droplets, count: "6 variants" },
            { name: "Belts & Chains", Icon: Link2, count: "5 variants" },
            { name: "Electrical", Icon: Zap, count: "9 variants" },
            { name: "Engine Parts", Icon: Wrench, count: "15 variants" },
          ].map((cat) => (
            <button
              key={cat.name}
              onClick={handleViewPartsCatalog}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                background: DASH.surface,
                border: `1px solid ${DASH.border}`,
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "left",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = BRAND.orange + "40";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = DASH.border;
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <span style={{ color: BRAND.orange, display: "flex" }}><cat.Icon size={20} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: DASH.text }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: 10.5, color: DASH.text3 }}>{cat.count}</div>
              </div>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke={DASH.text3}
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" strokeLinecap="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Manuals & Documentation */}
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: DASH.text,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <BookOpen size={18} color={BRAND.orange} />
          Manuals & Documentation
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* Existing document */}
          {equipment.document_url && (
            <a
              href={equipment.document_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: DASH.surface2,
                borderRadius: 10,
                border: `1px solid ${DASH.border}`,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = BRAND.orange + "40";
                (e.currentTarget as HTMLElement).style.background = DASH.surface;
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = DASH.border;
                (e.currentTarget as HTMLElement).style.background = DASH.surface2;
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: "rgba(232,105,44,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                <FileText size={20} color={BRAND.orange} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: DASH.text }}>
                  Equipment Manual
                </div>
                <div style={{ fontSize: 11, color: DASH.text3 }}>
                  User manual, specifications, and maintenance guide
                </div>
              </div>
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 99,
                  background: BRAND.orange,
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Download ↗
              </div>
            </a>
          )}

          {/* Missing manual request */}
          <button
            onClick={handleRequestManual}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              background: DASH.surface2,
              borderRadius: 10,
              border: `1px solid ${DASH.border}`,
              cursor: "pointer",
              transition: "all 0.15s",
              width: "100%",
              textAlign: "left",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = BRAND.orange + "40";
              (e.currentTarget as HTMLElement).style.background = DASH.surface;
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = DASH.border;
              (e.currentTarget as HTMLElement).style.background = DASH.surface2;
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "rgba(107,114,128,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              <HelpCircle size={20} color={DASH.text3} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: DASH.text }}>
                Missing a manual?
              </div>
              <div style={{ fontSize: 11, color: DASH.text3 }}>
                Request operator manual, parts book, or service guide
              </div>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={BRAND.orange}
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Compatible Equipment Note */}
      <div
        style={{
          padding: "12px 16px",
          background: "rgba(232,105,44,0.05)",
          borderRadius: 10,
          border: `1px solid rgba(232,105,44,0.15)`,
          fontSize: 12,
          color: DASH.text3,
          textAlign: "center",
        }}
      >
        <Lightbulb size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
        Parts inventory is managed in the{" "}
        <button
          onClick={() => router.push("/dashboard/parts")}
          style={{
            background: "none",
            border: "none",
            color: BRAND.orange,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Parts Management
        </button>{" "}
        module. Stock levels sync automatically across your fleet.
      </div>
    </div>
  );
}
