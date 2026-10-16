"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import {
  FundEntryRow,
  amountInWords,
  formatDate,
  formatINR,
  formatTime,
  receiptMessage,
} from "@/app/utils/fund";
import SharePreview from "./SharePreview";

/*
 * Receipt screen. The receipt card uses inline hex colours only:
 * html2canvas cannot parse Tailwind v4 oklch() colours.
 */
export default function ReceiptView({
  entry,
  onClose,
}: {
  entry: FundEntryRow;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const shareWhatsApp = () => setPreviewOpen(true);

  const download = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      // Loaded on demand so the dashboard stays light on slow phones
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#FFFFFF",
        useCORS: true,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${entry.receiptNo}_Fund_Challenge_Receipt.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Receipt download failed:", err);
      alert("Could not create the image. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const row = (label: string, value: React.ReactNode) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px dashed #CBD5E1" }}>
      <span style={{ color: "#64748B", fontSize: 14 }}>{label}</span>
      <span style={{ color: "#0F172A", fontSize: 14, fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm">
          {/* ===== RECEIPT CARD (captured as image) ===== */}
          <div
            ref={cardRef}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              overflow: "hidden",
              fontFamily: "inherit",
            }}
          >
            <div
              style={{
                backgroundColor: "#15803D",
                backgroundImage: "linear-gradient(135deg, #15803D 0%, #1C75BC 100%)",
                padding: "20px 20px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <img src="/icon.png" alt="SSF" style={{ width: 34, height: 34 }} />
              </div>
              <div>
                <p style={{ margin: 0, color: "#FFFFFF", fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
                  Fund Challenge
                </p>
                <p style={{ margin: 0, color: "#E0F2FE", fontSize: 13, fontWeight: 500 }}>
                  SSF Kozhikode South
                </p>
              </div>
            </div>

            <div style={{ padding: "16px 20px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#64748B" }}>RECEIPT</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#1C75BC", fontVariantNumeric: "tabular-nums" }}>
                  {entry.receiptNo}
                </span>
              </div>

              {row("Date & time", `${formatDate(entry.date)}, ${formatTime(entry.createdAt)}`)}
              {row("Received from", entry.contributorName)}
              {row("Collected by", entry.memberName)}

              <div style={{ margin: "16px 0 4px", padding: 14, borderRadius: 14, backgroundColor: "#F0FDF4", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "#15803D", fontVariantNumeric: "tabular-nums" }}>
                  {formatINR(entry.amount)}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 500, color: "#334155" }}>
                  {amountInWords(entry.amount)}
                </p>
              </div>

              <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 14, color: "#334155", lineHeight: 1.5 }}>
                Thank you for your generous contribution to the
                <br />
                <strong style={{ color: "#0F172A" }}>Fund Challenge</strong>.
              </p>
              <p style={{ margin: "6px 0 0", textAlign: "center", fontSize: 12, color: "#64748B" }}>
                SSF Kozhikode South District Committee
              </p>
            </div>
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={shareWhatsApp}
              className="w-full py-4 rounded-xl bg-[#25D366] text-[#0B3B1E] text-base font-semibold flex items-center justify-center gap-2 active:opacity-80 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41" />
              </svg>
              Share on WhatsApp
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={download}
                disabled={downloading}
                className="py-4 rounded-xl bg-white text-slate-900 text-base font-semibold flex items-center justify-center gap-2 active:bg-slate-100 disabled:opacity-70 cursor-pointer"
              >
                {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {downloading ? "Saving…" : "Download"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-4 rounded-xl bg-slate-700 text-white text-base font-semibold flex items-center justify-center gap-2 active:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
                Close
              </button>
            </div>
            {!entry.mobile && (
              <p className="text-center text-xs text-slate-200">
                No mobile number saved — WhatsApp will ask you to pick a contact.
              </p>
            )}
          </div>
        </div>
      </div>
      {previewOpen && (
        <SharePreview
          request={{ title: `Receipt ${entry.receiptNo}`, message: receiptMessage(entry), mobile: entry.mobile }}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}
