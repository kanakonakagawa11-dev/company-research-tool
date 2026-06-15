"use client";

import { useState, useEffect } from "react";
import type { Report } from "@/lib/supabase";

type ReportSummary = Pick<Report, "id" | "company_name" | "created_at">;

export default function Home() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoadingReports(true);
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch {
      // silent
    } finally {
      setLoadingReports(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;

    setLoading(true);
    setError("");
    setCurrentReport(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: companyName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
        if (data.content) {
          setCurrentReport({ id: "", company_name: companyName, content: data.content, created_at: "" });
        }
        return;
      }

      setCurrentReport(data.report);
      setCompanyName("");
      fetchReports();
    } catch {
      setError("ネットワークエラーが発生しました。再試行してください。");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectReport(id: string) {
    try {
      const res = await fetch(`/api/reports/${id}`);
      const data = await res.json();
      if (data.report) setCurrentReport(data.report);
    } catch {
      setError("レポートの読み込みに失敗しました");
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>🏢 企業調査レポートツール</h1>
        <p style={styles.headerSub}>企業名を入力するとAIがWeb検索で自動調査し、レポートを生成・保存します</p>
      </header>

      <div style={styles.main}>
        {/* Left sidebar: history */}
        <aside style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>📋 調査履歴</h2>
          {loadingReports ? (
            <p style={styles.sidebarEmpty}>読み込み中...</p>
          ) : reports.length === 0 ? (
            <p style={styles.sidebarEmpty}>まだレポートがありません</p>
          ) : (
            <ul style={styles.reportList}>
              {reports.map((r) => (
                <li
                  key={r.id}
                  style={{
                    ...styles.reportItem,
                    background: currentReport?.id === r.id ? "#e8f4fd" : "#fff",
                    borderLeft: currentReport?.id === r.id ? "3px solid #2563eb" : "3px solid transparent",
                  }}
                  onClick={() => handleSelectReport(r.id)}
                >
                  <span style={styles.reportItemName}>{r.company_name}</span>
                  <span style={styles.reportItemDate}>{formatDate(r.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Right: form + report */}
        <section style={styles.content}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputRow}>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="例：トヨタ自動車、Apple、ソフトバンク"
                style={styles.input}
                disabled={loading}
              />
              <button type="submit" style={styles.button} disabled={loading || !companyName.trim()}>
                {loading ? "調査中..." : "調査開始"}
              </button>
            </div>
            {loading && (
              <div style={styles.loadingBar}>
                <div style={styles.loadingText}>
                  🔍 AIがWebを検索してレポートを生成しています（1〜2分かかる場合があります）...
                </div>
              </div>
            )}
          </form>

          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          {currentReport && (
            <div style={styles.reportCard}>
              <div style={styles.reportHeader}>
                <h2 style={styles.reportTitle}>{currentReport.company_name} — 調査レポート</h2>
                {currentReport.created_at && (
                  <span style={styles.reportDate}>{formatDate(currentReport.created_at)}</span>
                )}
              </div>
              <div style={styles.reportBody}>
                {currentReport.content.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) {
                    return <h3 key={i} style={styles.reportH3}>{line.replace("## ", "")}</h3>;
                  }
                  if (line.startsWith("### ")) {
                    return <h4 key={i} style={styles.reportH4}>{line.replace("### ", "")}</h4>;
                  }
                  if (line.startsWith("- ") || line.startsWith("• ")) {
                    return <li key={i} style={styles.reportLi}>{line.replace(/^[-•] /, "")}</li>;
                  }
                  if (line.trim() === "") {
                    return <br key={i} />;
                  }
                  return <p key={i} style={styles.reportP}>{line}</p>;
                })}
              </div>
            </div>
          )}

          {!currentReport && !loading && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔍</div>
              <p>企業名を入力して「調査開始」を押すと、AIがWeb検索でレポートを自動生成します</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    color: "#fff",
    padding: "24px 32px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  headerTitle: {
    fontSize: "1.6rem",
    fontWeight: 700,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: "0.9rem",
    opacity: 0.85,
  },
  main: {
    display: "flex",
    flex: 1,
    gap: 0,
  },
  sidebar: {
    width: 260,
    minWidth: 200,
    background: "#fff",
    borderRight: "1px solid #e5e7eb",
    padding: "20px 0",
    overflowY: "auto",
  },
  sidebarTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#374151",
    padding: "0 16px 12px",
    borderBottom: "1px solid #f3f4f6",
  },
  sidebarEmpty: {
    padding: "16px",
    color: "#9ca3af",
    fontSize: "0.85rem",
  },
  reportList: {
    listStyle: "none",
    padding: 0,
  },
  reportItem: {
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #f9fafb",
    transition: "background 0.15s",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  reportItemName: {
    fontWeight: 600,
    fontSize: "0.9rem",
    color: "#111827",
  },
  reportItemDate: {
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  content: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
    maxWidth: "900px",
  },
  form: {
    marginBottom: 24,
  },
  inputRow: {
    display: "flex",
    gap: 12,
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    fontSize: "1rem",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    outline: "none",
    background: "#fff",
    transition: "border-color 0.2s",
  },
  button: {
    padding: "12px 28px",
    fontSize: "1rem",
    fontWeight: 600,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background 0.2s",
  },
  loadingBar: {
    marginTop: 12,
    padding: "12px 16px",
    background: "#eff6ff",
    borderRadius: 8,
    border: "1px solid #bfdbfe",
  },
  loadingText: {
    fontSize: "0.9rem",
    color: "#1d4ed8",
  },
  errorBox: {
    marginBottom: 20,
    padding: "14px 16px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    color: "#dc2626",
    fontSize: "0.9rem",
  },
  reportCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  reportHeader: {
    padding: "20px 24px",
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportTitle: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#111827",
  },
  reportDate: {
    fontSize: "0.8rem",
    color: "#9ca3af",
    whiteSpace: "nowrap",
  },
  reportBody: {
    padding: "24px",
    lineHeight: 1.8,
    fontSize: "0.95rem",
  },
  reportH3: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#1e3a8a",
    marginTop: 24,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: "2px solid #dbeafe",
  },
  reportH4: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#374151",
    marginTop: 12,
    marginBottom: 4,
  },
  reportLi: {
    marginLeft: 20,
    color: "#374151",
    marginBottom: 2,
  },
  reportP: {
    color: "#374151",
    marginBottom: 4,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 40px",
    color: "#9ca3af",
    textAlign: "center",
    fontSize: "0.95rem",
    gap: 16,
  },
  emptyIcon: {
    fontSize: "3rem",
  },
};
