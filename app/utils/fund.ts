/* Shared Fund Challenge helpers (used by client and API) */

export type FundMemberSummary = {
  _id: string;
  name: string;
  target: number;
  collected: number;
  balance: number;
  percent: number;
  entryCount: number;
};

export type FundEntryRow = {
  _id: string;
  memberId: string;
  memberName: string;
  contributorName: string;
  amount: number;
  mobile: string | null;
  date: string;
  createdAt: string;
  receiptNo: string;
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/* ₹1,00,000 */
export const formatINR = (n: number) => inr.format(Math.round(n || 0));

export const percentOf = (collected: number, target: number) =>
  target > 0 ? Math.round((collected / target) * 100) : 0;

/* red < 40%, orange 40–79%, green 80%+ */
export const progressTone = (pct: number) =>
  pct >= 80 ? "green" : pct >= 40 ? "orange" : "red";

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const twoDigits = (n: number) =>
  n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`;

const threeDigits = (n: number) => {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return [h ? `${ONES[h]} Hundred` : "", rest ? twoDigits(rest) : ""]
    .filter(Boolean)
    .join(" ");
};

/* Indian numbering: 1,25,000 → "One Lakh Twenty Five Thousand Rupees Only" */
export function amountInWords(amount: number): string {
  let n = Math.floor(Math.abs(amount || 0));
  if (n === 0) return "Zero Rupees Only";
  if (n === 1) return "One Rupee Only";

  const crore = Math.floor(n / 1_00_00_000);
  n %= 1_00_00_000;
  const lakh = Math.floor(n / 1_00_000);
  n %= 1_00_000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;

  const parts = [
    crore ? `${crore > 99 ? amountInWords(crore).replace(" Rupees Only", "") : twoDigits(crore)} Crore` : "",
    lakh ? `${twoDigits(lakh)} Lakh` : "",
    thousand ? `${twoDigits(thousand)} Thousand` : "",
    n ? threeDigits(n) : "",
  ].filter(Boolean);

  return `${parts.join(" ")} Rupees Only`;
}

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatTime = (d: string | Date) =>
  new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

/* Formatted text receipt for WhatsApp */
export function receiptMessage(e: FundEntryRow): string {
  return [
    "💰 *Fund Challenge — SSF Kozhikode South*",
    "🧾 *Receipt*",
    "",
    `🔖 *Receipt No:* ${e.receiptNo}`,
    `📅 *Date:* ${formatDate(e.date)}, ${formatTime(e.createdAt)}`,
    `👤 *Received from:* ${e.contributorName}`,
    `💵 *Amount:* ${formatINR(e.amount)}`,
    `✍️ _(${amountInWords(e.amount)})_`,
    `🙋 *Collected by:* ${e.memberName}`,
    "",
    "🤲 Thank you for your generous contribution to the Fund Challenge.",
    "💚 — SSF Kozhikode South District Committee",
  ].join("\n");
}

/* Opens that chat directly when a mobile number exists, else WhatsApp's contact picker */
export function whatsappUrl(message: string, mobile?: string | null): string {
  const text = encodeURIComponent(message);
  return mobile ? `https://wa.me/91${mobile}?text=${text}` : `https://wa.me/?text=${text}`;
}

type RankedMember = FundMemberSummary & { rank: number };

const MEDALS = ["🥇", "🥈", "🥉"];
const STATUS_EMOJI = { green: "🟢", orange: "🟠", red: "🔴" } as const;

/* WhatsApp summary: ranked members with collected amount and % */
export function membersSummaryMessage(
  rows: RankedMember[],
  totals: { target: number; collected: number; balance: number; percent: number }
): string {
  return [
    "💰 *Fund Challenge — SSF Kozhikode South*",
    `📊 Collection status · 📅 ${formatDate(new Date())}`,
    "",
    `🎯 *Target:* ${formatINR(totals.target)}`,
    `✅ *Collected:* ${formatINR(totals.collected)} (${totals.percent}%)`,
    `⏳ *Balance:* ${formatINR(totals.balance)}`,
    "",
    "🏆 *Members*",
    ...rows.map(
      (m) =>
        `${MEDALS[m.rank - 1] ?? `${m.rank}.`} ${STATUS_EMOJI[progressTone(m.percent)]} ${m.name} — ${formatINR(
          m.collected
        )} (${m.percent}%)`
    ),
    "",
    "🟢 80%+  🟠 40–79%  🔴 below 40%",
    "🤝 Let's reach the target together!",
  ].join("\n");
}

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/* Download members as CSV (BOM so Excel reads ₹/Malayalam names correctly) */
export function downloadMembersCsv(rows: RankedMember[]) {
  const header = ["Rank", "Name", "Target", "Collected", "Balance", "Achieved %"];
  const lines = rows.map((m) =>
    [m.rank, m.name, m.target, m.collected, m.balance, m.percent].map(csvCell).join(",")
  );
  const csv = "﻿" + [header.join(","), ...lines].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const link = document.createElement("a");
  link.href = url;
  link.download = `Fund_Challenge_Members_${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
