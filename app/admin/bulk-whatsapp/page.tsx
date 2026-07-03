"use client";

import React, { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  Users,
  Send,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  MessageSquare,
  ImageIcon,
  Zap,
  AlertCircle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Contact {
  name: string;
  mobile: string;
}

interface LogEntry {
  index: number;
  name: string;
  mobile: string;
  status: "sent" | "failed";
  reason?: string;
  time: string;
}

type SendingState = "idle" | "sending" | "paused" | "done";

// ── Constants ──────────────────────────────────────────────────────────────
const DEFAULT_TEMPLATE = "111_challange";
const DEFAULT_MEDIA_ID = "1033052079221832";
const DEFAULT_LANGUAGE = "en";
const PREVIEW_PAGE_SIZE = 10;

// ── Helpers ────────────────────────────────────────────────────────────────
function parseExcel(file: File): Promise<Contact[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const contacts: Contact[] = rows
          .map((row) => {
            // Flexible column detection (case-insensitive)
            const nameKey = Object.keys(row).find((k) =>
              k.toLowerCase().includes("name")
            );
            const mobileKey = Object.keys(row).find(
              (k) =>
                k.toLowerCase().includes("mobile") ||
                k.toLowerCase().includes("phone") ||
                k.toLowerCase().includes("number") ||
                k.toLowerCase().includes("mob")
            );
            return {
              name: nameKey ? String(row[nameKey]).trim() : "",
              mobile: mobileKey ? String(row[mobileKey]).trim() : "",
            };
          })
          .filter((c) => c.name && c.mobile);

        resolve(contacts);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BulkWhatsAppPage() {
  // File & contacts
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [fileName, setFileName] = useState("");
  const [previewPage, setPreviewPage] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState("");

  // Config
  const [templateName, setTemplateName] = useState(DEFAULT_TEMPLATE);
  const [mediaId, setMediaId] = useState(DEFAULT_MEDIA_ID);
  const [headerType, setHeaderType] = useState<"image" | "document" | "none">("image");
  const [languageCode, setLanguageCode] = useState(DEFAULT_LANGUAGE);
  const [delayMs, setDelayMs] = useState(1500);

  // Sending state
  const [sendingState, setSendingState] = useState<SendingState>("idle");
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [totalSent, setTotalSent] = useState(0);

  const abortRef = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File handling ────────────────────────────────────────────────────────
  const handleFile = async (file: File) => {
    setParseError("");
    try {
      const parsed = await parseExcel(file);
      if (parsed.length === 0) {
        setParseError("No valid contacts found. Ensure columns named 'name' and 'mobile'/'phone'.");
        return;
      }
      setContacts(parsed);
      setFileName(file.name);
      setPreviewPage(1);
      setSendingState("idle");
      setProgress(0);
      setSuccessCount(0);
      setFailedCount(0);
      setLog([]);
    } catch {
      setParseError("Failed to parse Excel file. Please check the format.");
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  // ── Send ─────────────────────────────────────────────────────────────────
  const startSending = async () => {
    if (!contacts.length || !templateName || !mediaId) return;
    abortRef.current = false;
    setSendingState("sending");
    setProgress(0);
    setSuccessCount(0);
    setFailedCount(0);
    setLog([]);
    setCurrentContact(null);

    try {
      const res = await fetch("/api/admin/bulk-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts, templateName, mediaId, headerType, languageCode, delayMs }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done || abortRef.current) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "progress") {
              setProgress(Math.round((event.index / event.total) * 100));
              setSuccessCount(event.successCount);
              setFailedCount(event.failedCount);
              setCurrentContact({ name: event.name, mobile: event.mobile });
              setTotalSent(event.index);

              const entry: LogEntry = {
                index: event.index,
                name: event.name,
                mobile: event.mobile,
                status: event.status,
                reason: event.reason,
                time: formatTime(new Date()),
              };
              setLog((prev) => [entry, ...prev].slice(0, 200));
            }

            if (event.type === "done") {
              setSendingState("done");
              setProgress(100);
              setCurrentContact(null);
            }
          } catch {}
        }
      }

      if (abortRef.current) {
        setSendingState("idle");
      }
    } catch (err: any) {
      setSendingState("idle");
      alert("Error: " + err.message);
    }
  };

  const stopSending = () => {
    abortRef.current = true;
    setSendingState("idle");
  };

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.ceil(contacts.length / PREVIEW_PAGE_SIZE);
  const pageContacts = contacts.slice(
    (previewPage - 1) * PREVIEW_PAGE_SIZE,
    previewPage * PREVIEW_PAGE_SIZE
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)",
        fontFamily: "'Inter', system-ui, sans-serif",
        paddingTop: "80px",
        paddingBottom: "60px",
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: "center", padding: "40px 20px 32px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(37,211,102,0.1)",
            border: "1px solid rgba(37,211,102,0.3)",
            borderRadius: "50px",
            padding: "8px 20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#25d366",
              boxShadow: "0 0 8px #25d366",
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ color: "#25d366", fontSize: "13px", fontWeight: 600 }}>
            WhatsApp Business API — Meta Cloud
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: "12px",
          }}
        >
          Bulk WhatsApp{" "}
          <span style={{ color: "#25d366" }}>Messenger</span>
        </h1>
        <p style={{ color: "#8899aa", fontSize: "16px", maxWidth: "480px", margin: "0 auto" }}>
          Upload your Excel sheet and send personalized WhatsApp messages to thousands of contacts.
        </p>
      </div>

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 20px",
          display: "grid",
          gap: "24px",
        }}
      >
        {/* ── Step 1: Upload ── */}
        <Card
          icon={<FileSpreadsheet size={20} />}
          title="Step 1 — Upload Excel File"
          accent="#25d366"
        >
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? "#25d366" : "rgba(255,255,255,0.15)"}`,
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              background: isDragging ? "rgba(37,211,102,0.06)" : "rgba(255,255,255,0.02)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(37,211,102,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Upload size={28} color="#25d366" />
            </div>
            {fileName ? (
              <>
                <p style={{ color: "#25d366", fontWeight: 700, fontSize: "16px" }}>{fileName}</p>
                <p style={{ color: "#8899aa", fontSize: "14px", marginTop: 4 }}>
                  {contacts.length.toLocaleString()} contacts detected · Click to change file
                </p>
              </>
            ) : (
              <>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>
                  Drop your Excel file here
                </p>
                <p style={{ color: "#8899aa", fontSize: "14px", marginTop: 6 }}>
                  Supports .xlsx and .xls — columns: <code style={{ color: "#25d366" }}>name</code> &{" "}
                  <code style={{ color: "#25d366" }}>mobile</code>
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={onFileInput}
            style={{ display: "none" }}
          />
          {parseError && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 16px",
                borderRadius: 8,
                background: "rgba(255,80,80,0.1)",
                border: "1px solid rgba(255,80,80,0.3)",
                color: "#ff8080",
                fontSize: "13px",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <AlertCircle size={14} /> {parseError}
            </div>
          )}
        </Card>

        {/* ── Step 2: Config ── */}
        <Card
          icon={<MessageSquare size={20} />}
          title="Step 2 — Message Configuration"
          accent="#128C7E"
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>WhatsApp Template Name</label>
              <input
                style={inputStyle}
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. event_reminder"
              />
              <p style={hintStyle}>Must be an approved template in your Meta Business account</p>
            </div>
            <div>
              <label style={labelStyle}>
                <ImageIcon size={13} style={{ display: "inline", marginRight: 5 }} />
                Image Media ID
              </label>
              <input
                style={inputStyle}
                value={mediaId}
                onChange={(e) => setMediaId(e.target.value)}
                placeholder="e.g. 2289585044841032"
              />
              <p style={hintStyle}>Upload image in Meta Business Suite → get the Media ID</p>
            </div>
            <div>
              <label style={labelStyle}>Delay Between Messages (ms)</label>
              <input
                style={inputStyle}
                type="number"
                min={500}
                max={10000}
                value={delayMs}
                onChange={(e) => setDelayMs(Number(e.target.value))}
              />
              <p style={hintStyle}>Recommended: 1000–2000 ms to avoid rate limits</p>
            </div>
            <div>
              <label style={labelStyle}>Header Type</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={headerType}
                onChange={(e) => setHeaderType(e.target.value as "image" | "document" | "none")}
              >
                <option value="image">Image (image header)</option>
                <option value="document">Document / PDF header</option>
                <option value="none">None (text-only template)</option>
              </select>
              <p style={hintStyle}>Must match the header type defined in your approved template</p>
            </div>
            <div>
              <label style={labelStyle}>Language Code</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
              >
                <option value="en">en — English</option>
                <option value="ml">ml — Malayalam</option>
                <option value="hi">hi — Hindi</option>
                <option value="ar">ar — Arabic</option>
                <option value="en_US">en_US — English (US)</option>
              </select>
              <p style={hintStyle}>Language code must match your approved template</p>
            </div>
            <div
              style={{
                background: "rgba(37,211,102,0.06)",
                border: "1px solid rgba(37,211,102,0.2)",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "#8899aa", fontSize: "12px", marginBottom: "6px" }}>Estimated time for {contacts.length || 0} contacts</p>
              <p style={{ color: "#25d366", fontSize: "22px", fontWeight: 700 }}>
                {contacts.length
                  ? `~${Math.ceil((contacts.length * delayMs) / 60000)} min`
                  : "Upload file first"}
              </p>
              <p style={{ color: "#8899aa", fontSize: "11px", marginTop: 4 }}>
                at {delayMs}ms delay per message
              </p>
            </div>
          </div>
        </Card>

        {/* ── Step 3: Preview ── */}
        {contacts.length > 0 && (
          <Card
            icon={<Users size={20} />}
            title={`Step 3 — Contact Preview (${contacts.length.toLocaleString()} contacts)`}
            accent="#075E54"
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["#", "Name", "Mobile"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#8899aa",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderBottom: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageContacts.map((c, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "transparent")
                      }
                    >
                      <td style={tdStyle}>
                        {(previewPage - 1) * PREVIEW_PAGE_SIZE + i + 1}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 500, color: "#fff" }}>{c.name}</td>
                      <td style={{ ...tdStyle, color: "#25d366", fontFamily: "monospace" }}>
                        +91 {c.mobile}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "16px",
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p style={{ color: "#8899aa", fontSize: "13px" }}>
                  Page {previewPage} of {totalPages}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <PaginationBtn
                    onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                    disabled={previewPage === 1}
                    icon={<ChevronLeft size={16} />}
                  />
                  <PaginationBtn
                    onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
                    disabled={previewPage === totalPages}
                    icon={<ChevronRight size={16} />}
                  />
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ── Step 4: Send ── */}
        <Card
          icon={<Zap size={20} />}
          title="Step 4 — Send Messages"
          accent="#25d366"
        >
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
            <StatBox label="Total" value={contacts.length.toLocaleString()} icon={<Users size={16} />} color="#8899aa" />
            <StatBox label="Processed" value={totalSent.toString()} icon={<Clock size={16} />} color="#60a5fa" />
            <StatBox label="Sent" value={successCount.toString()} icon={<CheckCircle size={16} />} color="#25d366" />
            <StatBox label="Failed" value={failedCount.toString()} icon={<XCircle size={16} />} color="#f87171" />
          </div>

          {/* Progress bar */}
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: "50px",
              height: "10px",
              overflow: "hidden",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #25d366, #128C7E)",
                borderRadius: "50px",
                transition: "width 0.4s ease",
                boxShadow: "0 0 12px rgba(37,211,102,0.5)",
              }}
            />
          </div>

          {/* Current contact */}
          {currentContact && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: "rgba(37,211,102,0.08)",
                border: "1px solid rgba(37,211,102,0.2)",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#25d366",
                  animation: "pulse 1s infinite",
                  flexShrink: 0,
                }}
              />
              <div>
                <p style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>
                  Sending to {currentContact.name}
                </p>
                <p style={{ color: "#8899aa", fontSize: "12px" }}>+91 {currentContact.mobile}</p>
              </div>
              <p style={{ marginLeft: "auto", color: "#25d366", fontWeight: 700 }}>{progress}%</p>
            </div>
          )}

          {sendingState === "done" && (
            <div
              style={{
                padding: "14px 20px",
                borderRadius: "12px",
                background: "rgba(37,211,102,0.1)",
                border: "1px solid rgba(37,211,102,0.3)",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              <CheckCircle size={24} color="#25d366" style={{ marginBottom: 6 }} />
              <p style={{ color: "#25d366", fontWeight: 700, fontSize: "16px" }}>
                All done! {successCount} sent · {failedCount} failed
              </p>
            </div>
          )}

          {/* Control buttons */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={startSending}
              disabled={!contacts.length || sendingState === "sending" || !templateName || !mediaId}
              style={{
                padding: "12px 28px",
                borderRadius: "12px",
                background:
                  !contacts.length || sendingState === "sending"
                    ? "rgba(37,211,102,0.2)"
                    : "linear-gradient(135deg,#25d366,#128C7E)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                border: "none",
                cursor: !contacts.length || sendingState === "sending" ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s",
                opacity: !contacts.length || sendingState === "sending" ? 0.5 : 1,
              }}
            >
              <Send size={16} />
              {sendingState === "sending"
                ? "Sending…"
                : sendingState === "done"
                ? "Send Again"
                : "Start Sending"}
            </button>

            {sendingState === "sending" && (
              <button
                onClick={stopSending}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "rgba(248,113,113,0.15)",
                  color: "#f87171",
                  fontWeight: 600,
                  fontSize: "15px",
                  border: "1px solid rgba(248,113,113,0.3)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Square size={14} fill="#f87171" /> Stop
              </button>
            )}
          </div>
        </Card>

        {/* ── Log ── */}
        {log.length > 0 && (
          <Card icon={<CheckCircle size={20} />} title="Activity Log" accent="#4b5563">
            <div
              style={{
                maxHeight: "320px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {log.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background:
                      entry.status === "sent"
                        ? "rgba(37,211,102,0.05)"
                        : "rgba(248,113,113,0.05)",
                  }}
                >
                  {entry.status === "sent" ? (
                    <CheckCircle size={14} color="#25d366" style={{ flexShrink: 0 }} />
                  ) : (
                    <XCircle size={14} color="#f87171" style={{ flexShrink: 0 }} />
                  )}
                  <span style={{ color: "#fff", fontSize: "13px", fontWeight: 500, minWidth: 150 }}>
                    {entry.name}
                  </span>
                  <span style={{ color: "#8899aa", fontSize: "12px", fontFamily: "monospace" }}>
                    +91 {entry.mobile}
                  </span>
                  {entry.reason && (
                    <span style={{ color: "#f87171", fontSize: "11px" }}>· {entry.reason}</span>
                  )}
                  <span style={{ marginLeft: "auto", color: "#4b5563", fontSize: "11px" }}>
                    {entry.time}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </Card>
        )}
      </div>

      {/* Global pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Card({
  children,
  icon,
  title,
  accent,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "28px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: `${accent}20`,
            border: `1px solid ${accent}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent,
          }}
        >
          {icon}
        </div>
        <h2 style={{ color: "#fff", fontSize: "16px", fontWeight: 700 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, color, marginBottom: 6 }}>
        {icon}
        <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: "24px", fontWeight: 800, color: "#fff" }}>{value}</p>
    </div>
  );
}

function PaginationBtn({
  onClick,
  disabled,
  icon,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 34,
        height: 34,
        borderRadius: "8px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: disabled ? "#4b5563" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </button>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#8899aa",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const hintStyle: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "11px",
  marginTop: "5px",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: "13px",
  color: "#a0aec0",
};
