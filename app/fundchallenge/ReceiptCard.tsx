"use client";

import { forwardRef } from "react";
import { FundEntryRow, amountInWords, formatDate, formatINR, formatTime } from "@/app/utils/fund";

/* Design canvas; exported at 2.56× → 2048 × 2560 */
export const RECEIPT_W = 800;
export const RECEIPT_H = 1000;

const FONT = "var(--font-fc-receipt), Lexend, 'Plus Jakarta Sans', sans-serif";
const COOPER = '"Cooper Black", var(--font-cooper-font), serif';

/*
 * E-receipt in the SSF Kozhikode South design.
 * Inline hex colours only: html2canvas cannot parse Tailwind v4 oklch().
 */
const ReceiptCard = forwardRef<HTMLDivElement, { entry: FundEntryRow; scale: number }>(
  function ReceiptCard({ entry, scale }, ref) {
    const name = entry.contributorName.trim();
    const nameSize = name.length > 26 ? 21 : name.length > 18 ? 25 : 29;

    const row = (label: string, value: React.ReactNode, valueStyle: React.CSSProperties = {}) => (
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          paddingBottom: 10,
          borderBottom: "1.5px dashed #555555",
          marginBottom: 35,
        }}
      >
        <span style={{ fontSize: 29, fontWeight: 400, color: "#111111", whiteSpace: "nowrap" }}>{label}</span>
        <span
          style={{
            fontSize: 29,
            fontWeight: 700,
            color: "#111111",
            textAlign: "right",
            lineHeight: 1.2,
            ...valueStyle,
          }}
        >
          {value}
        </span>
      </div>
    );

    return (
      <div
        ref={ref}
        data-receipt-card="true"
        style={{
          position: "relative",
          width: RECEIPT_W,
          height: RECEIPT_H,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          fontFamily: FONT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* ===== HEADER (curved bottom + dashed curve), SVG so the export keeps the curve ===== */}
        <svg
          width={RECEIPT_W}
          height={224}
          viewBox={`0 0 ${RECEIPT_W} 224`}
          style={{ position: "absolute", top: 0, left: 0, display: "block" }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="fcHeaderGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2790B0" />
              <stop offset="45%" stopColor="#266CAA" />
              <stop offset="100%" stopColor="#2341A2" />
            </linearGradient>
          </defs>
          <path d="M0 0 H800 V188 Q400 254 0 188 Z" fill="url(#fcHeaderGrad)" />
          <path
            d="M0 178 Q400 236 800 178"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.95"
            strokeWidth="2.5"
            strokeDasharray="9 7"
          />
        </svg>

        {/* Logo + committee name */}
        <div
          style={{
            position: "absolute",
            top: 55,
            left: 0,
            width: RECEIPT_W,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 17,
          }}
        >
          <div
            style={{
              width: 81,
              height: 107,
              borderRadius: 17,
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img src="/icon.png" alt="SSF" crossOrigin="anonymous" style={{ width: 74, height: 74 }} />
          </div>
          <div style={{ color: "#FFFFFF", fontSize: 40, fontWeight: 600, lineHeight: 1.12 }}>
            <div>
              <span style={{ fontFamily: COOPER, fontWeight: 400 }}>SSF</span> Kozhikode South
            </div>
            <div>District Committee</div>
          </div>
        </div>

        {/* ===== CARD ===== */}
        <div
          style={{
            position: "absolute",
            top: 270,
            left: 44,
            width: 712,
            height: 685,
            border: "1px solid #6B6B6B",
            borderRadius: 24,
            backgroundColor: "#FFFFFF",
          }}
        />

        {/* E - RECEIPT pill on the card border */}
        <div
          style={{
            position: "absolute",
            top: 247,
            left: 0,
            width: RECEIPT_W,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              padding: "2px 16px 4px",
              border: "1px solid #555555",
              borderRadius: 7,
              backgroundColor: "#FFFFFF",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 700,
              fontSize: 39,
              lineHeight: 1.1,
              color: "#000000",
              letterSpacing: 0.5,
            }}
          >
            E - RECEIPT
          </div>
        </div>

        {/* Rows */}
        <div style={{ position: "absolute", top: 386, left: 90, width: 610 }}>
          {row("Receipt No.", entry.receiptNo, { color: "#2A3F9E" })}
          {row("Date & Time", `${formatDate(entry.date)}, ${formatTime(entry.createdAt)}`)}
          {row("Received From", name, { fontSize: nameSize })}
        </div>

        {/* Amount */}
        <div
          style={{
            position: "absolute",
            top: 639,
            left: 89,
            width: 611,
            height: 207,
            borderRadius: 22,
            backgroundColor: "#F0FEF5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1, color: "#3B8B58" }}>
            {formatINR(entry.amount)}
          </div>
          <div style={{ marginTop: 14, fontSize: 23, fontWeight: 400, color: "#111111", textAlign: "center", padding: "0 16px" }}>
            {amountInWords(entry.amount)}
          </div>
        </div>

        {/* Thank you */}
        <div style={{ position: "absolute", top: 875, left: 0, width: RECEIPT_W, textAlign: "center" }}>
          <div style={{ fontSize: 22, color: "#111111" }}>Thank you for your generous contribution</div>
          <div style={{ marginTop: 4, fontSize: 17, color: "#A3A3A3" }}>
            <span style={{ fontFamily: COOPER }}>SSF</span> Kozhikode South District Committee
          </div>
        </div>
      </div>
    );
  }
);

export default ReceiptCard;
