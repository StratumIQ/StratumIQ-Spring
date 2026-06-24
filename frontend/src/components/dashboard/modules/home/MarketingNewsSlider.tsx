
"use client";

import { useEffect, useState } from "react";
import {
  getDashboardMarketing,
  DashboardMarketingItem,
} from "@/lib/api/dashboardMarketing";

export default function MarketingNewsSlider() {
  const [news, setNews] = useState<
    DashboardMarketingItem[]
  >([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const nextNews = () => {
  setCurrentIndex(
    (prev) => (prev + 1) % news.length
  );
};

const previousNews = () => {
  setCurrentIndex(
    (prev) =>
      prev === 0
        ? news.length - 1
        : prev - 1
  );
};

  const [selectedNews, setSelectedNews] =
    useState<DashboardMarketingItem | null>(
      null
    );

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    if (news.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(
        (prev) => (prev + 1) % news.length
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [news]);

  async function loadNews() {
    try {
      const response =
        await getDashboardMarketing();

      setNews(response);
    } catch (error) {
      console.error(
        "Failed to load marketing news",
        error
      );
    }
  }

  if (news.length === 0) {
    return null;
  }

  const currentNews = news[currentIndex];

  return (
    <>
      <div
        style={{
          background: "#fff7ed",
          boxShadow:
      "0 2px 10px rgba(0,0,0,0.04)",
          border: "1px solid #fed7aa",
          borderRadius: "12px",
          padding: "14px 18px",
          marginBottom: "20px",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onClick={() =>
          setSelectedNews(currentNews)
        }
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#ea580c",
            marginBottom: "6px",
          }}
        >
          LATEST UPDATES
        </div>
        <div
  style={{
    fontSize: "11px",
    color: "#9ca3af",
    marginBottom: "10px",
  }}
>
  Click announcement to read details
</div>

        <div>
  <div
  style={{
    fontSize: "16px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "6px",
    transition: "all 0.4s ease",
  }}
>
  📰 {currentNews.title}
</div>

  <div
  style={{
    fontSize: "14px",
    color: "#6b7280",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  }}
>
    {currentNews.body ||
      "Click to view announcement"}
  </div>
<div
  style={{
    marginTop: "10px",
    fontSize: "12px",
    color: "#9ca3af",
  }}
>
  {currentIndex + 1} / {news.length}
</div>
<div
  style={{
    display: "flex",
    gap: "6px",
    marginTop: "8px",
  }}
>

  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginTop: "12px",
  }}
>
  <button
    onClick={(e) => {
      e.stopPropagation();
      previousNews();
    }}
    style={{
      border: "none",
      background: "transparent",
      color: "#E8692C",
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    ← Previous
  </button>

  <button
    onClick={(e) => {
      e.stopPropagation();
      nextNews();
    }}
    style={{
      border: "none",
      background: "transparent",
      color: "#E8692C",
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    Next →
  </button>
</div>

  {news.map((_, index) => (
  <button
    key={index}
    onClick={(e) => {
      e.stopPropagation();
      setCurrentIndex(index);
    }}
    style={{
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      background:
        index === currentIndex
          ? "#ea580c"
          : "#d1d5db",
    }}
  />
))}
</div>
</div>
      </div>

      {selectedNews && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "700px",
              maxWidth: "90%",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                marginBottom: "16px",
              }}
            >
              {selectedNews.title}
            </h2>

            {selectedNews.imageUrl && (
              <img
                src={selectedNews.imageUrl}
                alt={selectedNews.title}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  maxHeight: "300px",
                  objectFit: "cover",
                }}
              />
            )}

            <p
              style={{
                color: "#555",
                lineHeight: "1.6",
              }}
            >
              {selectedNews.body ||
                "No details available."}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <button
                onClick={() =>
                  setSelectedNews(null)
                }
                style={{
                  background: "#E8692C",
                  color: "#fff",
                  border: "none",
                  padding:
                    "10px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}