/**
 * AnalyticsTab — StratumIQ
 * Path: frontend/src/components/dashboard/fleet/tabs/AnalyticsTab.tsx
 *
 * Analytics tab for FleetDetail.
 * Matches PDF §4.5 — Analytics section.
 * Displays efficiency score, cost per hour, maintenance vs uptime ratio,
 * performance trends, and export options.
 */

"use client";

import { useState, useMemo } from "react";
import { DASH, BRAND } from "@/lib/constants";
import { safeFloat } from "@/lib/utils";
import type { FleetEquipment, ServiceRecord, OperationLog } from "@/types/fleet";

interface AnalyticsTabProps {
  equipment: FleetEquipment;
  serviceRecords?: ServiceRecord[];
  operations?: OperationLog[];
}

export default function AnalyticsTab({ 
  equipment, 
  serviceRecords = [], 
  operations = [] 
}: AnalyticsTabProps) {
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year" | "all">("year");
  const [exporting, setExporting] = useState(false);

  // Calculate analytics
  const analytics = useMemo(() => {
    const currentHours = safeFloat(equipment.running_hours);
    const serviceCount = parseInt(equipment.service_count || "0");
    const overdueCount = parseInt(equipment.overdue_count || "0");
    
    // Calculate total maintenance cost
    const totalMaintenanceCost = serviceRecords.reduce((sum, record) => {
      return sum + (record.cost ? parseFloat(record.cost) : 0);
    }, 0);
    
    // Calculate cost per hour
    const costPerHour = currentHours > 0 ? totalMaintenanceCost / currentHours : 0;
    
    // Calculate efficiency score (based on uptime, service compliance, hours utilization)
    let efficiencyScore = 85; // Base score
    
    // Deduct for overdue services
    efficiencyScore -= overdueCount * 8;
    
    // Deduct for high cost per hour (above ₹500)
    if (costPerHour > 500) efficiencyScore -= 10;
    else if (costPerHour > 300) efficiencyScore -= 5;
    
    // Add for regular service (more than 2 records)
    if (serviceCount > 2) efficiencyScore += 5;
    
    // Cap between 0-100
    efficiencyScore = Math.min(100, Math.max(0, efficiencyScore));
    
    // Calculate uptime percentage (estimated)
    const downtimeOps = operations.filter(op => op.event_type === "downtime").length;
    const uptimePercentage = Math.max(0, 100 - (downtimeOps * 3));
    
    // Maintenance vs Uptime ratio
    const maintenanceRatio = serviceCount > 0 ? (overdueCount / serviceCount) * 100 : 0;
    
    return {
      efficiencyScore,
      efficiencyLabel: efficiencyScore >= 80 ? "Excellent" : efficiencyScore >= 60 ? "Good" : efficiencyScore >= 40 ? "Fair" : "Poor",
      efficiencyColor: efficiencyScore >= 80 ? DASH.green : efficiencyScore >= 60 ? DASH.blue : efficiencyScore >= 40 ? DASH.amber : DASH.red,
      totalMaintenanceCost,
      costPerHour,
      uptimePercentage,
      uptimeLabel: uptimePercentage >= 90 ? "Optimal" : uptimePercentage >= 75 ? "Good" : uptimePercentage >= 60 ? "Fair" : "Critical",
      uptimeColor: uptimePercentage >= 90 ? DASH.green : uptimePercentage >= 75 ? DASH.blue : uptimePercentage >= 60 ? DASH.amber : DASH.red,
      maintenanceRatio,
      serviceCount,
      overdueCount,
      currentHours,
    };
  }, [equipment, serviceRecords, operations]);

  // Generate trend data (mock - in production would come from API)
  const trendData = useMemo(() => {
    const months = timeRange === "month" ? 6 : timeRange === "quarter" ? 12 : timeRange === "year" ? 24 : 36;
    const data = [];
    let baseHours = safeFloat(equipment.running_hours) - (months * 45);
    if (baseHours < 0) baseHours = 0;
    
    for (let i = 0; i < months; i += months / 6) {
      const idx = Math.floor(i);
      const monthHours = baseHours + (idx * 45);
      data.push({
        month: idx,
        hours: monthHours,
        efficiency: 65 + Math.sin(idx * 0.5) * 15 + Math.random() * 5,
      });
    }
    return data;
  }, [equipment, timeRange]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const exportData = {
        equipment: {
          name: equipment.name,
          brand: equipment.brand,
          model: equipment.model,
          serial_number: equipment.serial_number,
        },
        analytics: analytics,
        generated_at: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${equipment.name}_analytics_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = () => {
    setExporting(true);
    try {
      const headers = ["Metric", "Value", "Unit"];
      const rows = [
        ["Equipment Name", equipment.name, ""],
        ["Brand", equipment.brand || "-", ""],
        ["Model", equipment.model || "-", ""],
        ["Running Hours", analytics.currentHours.toLocaleString(), "hrs"],
        ["Efficiency Score", analytics.efficiencyScore, "%"],
        ["Efficiency Label", analytics.efficiencyLabel, ""],
        ["Total Maintenance Cost", `₹${analytics.totalMaintenanceCost.toLocaleString()}`, ""],
        ["Cost Per Hour", `₹${analytics.costPerHour.toFixed(2)}`, "/hr"],
        ["Uptime", analytics.uptimePercentage.toFixed(1), "%"],
        ["Uptime Status", analytics.uptimeLabel, ""],
        ["Service Records", analytics.serviceCount, ""],
        ["Overdue Services", analytics.overdueCount, ""],
        ["Maintenance Ratio", analytics.maintenanceRatio.toFixed(1), "%"],
        ["Generated At", new Date().toLocaleString(), ""],
      ];
      
      const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${equipment.name}_analytics_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* Header with Export Options */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: DASH.text, marginBottom: 4 }}>
            Performance Analytics
          </div>
          <div style={{ fontSize: 12, color: DASH.text3 }}>
            Real-time equipment efficiency and cost metrics
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button 
            onClick={handleExportCSV} 
            disabled={exporting}
            className="btn-secondary"
            style={{ height: 34, fontSize: 12 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            CSV
          </button>
          <button 
            onClick={handleExport} 
            disabled={exporting}
            className="btn-primary"
            style={{ height: 34, fontSize: 12 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {exporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {/* Efficiency Score Card */}
        <div style={{
          background: DASH.surface2,
          borderRadius: 12,
          padding: "16px",
          border: `1px solid ${DASH.border}`,
        }}>
          <div style={{ fontSize: 11, color: DASH.text3, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Efficiency Score
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: analytics.efficiencyColor, letterSpacing: "-0.02em" }}>
            {analytics.efficiencyScore}%
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: analytics.efficiencyColor, marginTop: 4 }}>
            {analytics.efficiencyLabel}
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 4, background: DASH.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${analytics.efficiencyScore}%`, height: "100%", background: analytics.efficiencyColor, borderRadius: 99 }} />
            </div>
          </div>
        </div>

        {/* Cost Per Hour Card */}
        <div style={{
          background: DASH.surface2,
          borderRadius: 12,
          padding: "16px",
          border: `1px solid ${DASH.border}`,
        }}>
          <div style={{ fontSize: 11, color: DASH.text3, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Cost Per Hour
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: DASH.text, letterSpacing: "-0.02em" }}>
            ₹{analytics.costPerHour.toFixed(2)}
          </div>
          <div style={{ fontSize: 11, color: DASH.text3, marginTop: 4 }}>
            Total: ₹{analytics.totalMaintenanceCost.toLocaleString()}
          </div>
        </div>

        {/* Uptime Card */}
        <div style={{
          background: DASH.surface2,
          borderRadius: 12,
          padding: "16px",
          border: `1px solid ${DASH.border}`,
        }}>
          <div style={{ fontSize: 11, color: DASH.text3, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Uptime
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: analytics.uptimeColor, letterSpacing: "-0.02em" }}>
            {analytics.uptimePercentage.toFixed(1)}%
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: analytics.uptimeColor, marginTop: 4 }}>
            {analytics.uptimeLabel}
          </div>
        </div>

        {/* Maintenance Ratio Card */}
        <div style={{
          background: DASH.surface2,
          borderRadius: 12,
          padding: "16px",
          border: `1px solid ${DASH.border}`,
        }}>
          <div style={{ fontSize: 11, color: DASH.text3, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Maintenance Ratio
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: analytics.maintenanceRatio > 20 ? DASH.red : DASH.green, letterSpacing: "-0.02em" }}>
            {analytics.maintenanceRatio.toFixed(1)}%
          </div>
          <div style={{ fontSize: 11, color: DASH.text3, marginTop: 4 }}>
            {analytics.overdueCount} overdue of {analytics.serviceCount}
          </div>
        </div>
      </div>

      {/* Performance Trends Section */}
      <div>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: DASH.text,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}>
          <span>Performance Trends</span>
          <div style={{ display: "flex", gap: 6 }}>
            {(["month", "quarter", "year", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  background: timeRange === range ? BRAND.orange : "transparent",
                  color: timeRange === range ? "#fff" : DASH.text3,
                  border: `1px solid ${timeRange === range ? BRAND.orange : DASH.border}`,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {range === "month" ? "6M" : range === "quarter" ? "12M" : range === "year" ? "24M" : "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Simple bar chart visualization */}
        <div style={{
          background: DASH.surface2,
          borderRadius: 12,
          padding: "20px",
          border: `1px solid ${DASH.border}`,
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: DASH.text3, marginBottom: 4 }}>Running Hours Trend</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
              {trendData.map((point, idx) => {
                const maxHours = Math.max(...trendData.map(p => p.hours), 1);
                const height = (point.hours / maxHours) * 100;
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: "100%",
                      height: `${height}%`,
                      minHeight: 4,
                      background: `linear-gradient(to top, ${BRAND.orange}, ${BRAND.orangeHover})`,
                      borderRadius: 4,
                      transition: "height 0.3s ease",
                    }} />
                    <div style={{ fontSize: 9, color: DASH.text3, transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>
                      M{point.month + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${DASH.border}`, paddingTop: 16, marginTop: 8 }}>
            <div style={{ fontSize: 12, color: DASH.text3, marginBottom: 4 }}>Efficiency Trend</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
              {trendData.map((point, idx) => (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%",
                    height: `${point.efficiency}%`,
                    minHeight: 4,
                    background: `linear-gradient(to top, ${analytics.efficiencyColor}, ${analytics.efficiencyColor}80)`,
                    borderRadius: 4,
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: DASH.text,
          marginBottom: 12,
        }}>
          Detailed Metrics
        </div>
        <div style={{
          background: DASH.surface2,
          borderRadius: 12,
          border: `1px solid ${DASH.border}`,
          overflow: "hidden",
        }}>
          {[
            { label: "Total Running Hours", value: analytics.currentHours.toLocaleString(), unit: "hrs" },
            { label: "Total Service Records", value: analytics.serviceCount, unit: "" },
            { label: "Overdue Services", value: analytics.overdueCount, unit: "", highlight: analytics.overdueCount > 0 },
            { label: "Total Maintenance Cost", value: `₹${analytics.totalMaintenanceCost.toLocaleString()}`, unit: "" },
            { label: "Average Cost per Service", value: analytics.serviceCount > 0 ? `₹${(analytics.totalMaintenanceCost / analytics.serviceCount).toFixed(2)}` : "₹0", unit: "" },
            { label: "Maintenance vs Uptime", value: `${analytics.maintenanceRatio.toFixed(1)}%`, unit: "", 
              subtext: `${analytics.uptimePercentage.toFixed(1)}% uptime` },
          ].map((metric, idx) => (
            <div
              key={metric.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: idx < 5 ? `1px solid ${DASH.border}` : "none",
                background: metric.highlight ? "rgba(220,38,38,0.04)" : "transparent",
              }}
            >
              <span style={{ fontSize: 12.5, color: DASH.text3 }}>{metric.label}</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: metric.highlight ? DASH.red : DASH.text }}>
                  {metric.value}
                </span>
                {metric.subtext && (
                  <div style={{ fontSize: 10, color: DASH.text3 }}>{metric.subtext}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations Section */}
      {analytics.overdueCount > 0 && (
        <div style={{
          padding: "14px 16px",
          background: "rgba(217,119,6,0.08)",
          borderRadius: 10,
          border: `1px solid rgba(217,119,6,0.2)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DASH.amber} strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: DASH.amber }}>Action Recommended</div>
            <div style={{ fontSize: 12, color: DASH.text2 }}>
              {analytics.overdueCount} overdue service{analytics.overdueCount !== 1 ? "s are" : " is"} affecting equipment efficiency.
              Schedule maintenance to improve performance.
            </div>
          </div>
          <button 
            onClick={() => window.location.href = `/dashboard/fleet/${equipment.id}?tab=maintenance`}
            className="btn-primary"
            style={{ height: 34, fontSize: 12, background: DASH.amber }}
          >
            View Maintenance
          </button>
        </div>
      )}
    </div>
  );
}