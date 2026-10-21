"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import { FundEntryRow } from "@/app/utils/fund";
import ReceiptCard, { RECEIPT_H, RECEIPT_W } from "./ReceiptCard";

const EXPORT_SCALE = 2048 / RECEIPT_W; // → 2048 × 2560 PNG

/*
 * Receipt screen: shows the e-receipt and shares it as an IMAGE.
 * The PNG is rendered as soon as the screen opens, so the share sheet can
 * open straight from the tap (browsers require that).
 */
export default function ReceiptView({
  entry,
  onClose,
}: {
  entry: FundEntryRow;
  onClose: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);
  const [image, setImage] = useState<Blob | null>(null);
  const [renderError, setRenderError] = useState(false);
  const [busy, setBusy] = useState<"share" | "download" | null>(null);
  const [notice, setNotice] = useState("");

  const fileName = `${entry.receiptNo}_Receipt.png`;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Fit the 800 × 1000 design into the available width
  useEffect(() => {
    const fit = () => {
      const w = wrapRef.current?.clientWidth || 360;
      setScale(Math.min(w, 420) / RECEIPT_W);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const render = useCallback(async (): Promise<Blob | null> => {
    const node = cardRef.current;
    if (!node) return null;

    // Wait for fonts and the logo so the image matches the screen
    try {
      await (document as any).fonts?.ready;
    } catch {}
    await Promise.all(
      Array.from(node.querySelectorAll("img")).map((img) =>
        img.complete ? null : new Promise((r) => ((img.onload = r), (img.onerror = r)))
      )
    );

    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(node, {
      scale: EXPORT_SCALE,
      width: RECEIPT_W,
      height: RECEIPT_H,
      backgroundColor: "#FFFFFF",
      useCORS: true,
      onclone: (doc) => {
        const clone = doc.querySelector('[data-receipt-card="true"]') as HTMLElement | null;
        if (clone) clone.style.transform = "none";
      },
    });
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  }, []);

  // Pre-render once the card is on screen
  useEffect(() => {
    let alive = true;
    setImage(null);
    setRenderError(false);
    const t = window.setTimeout(async () => {
      try {
        const blob = await render();
        if (alive) blob ? setImage(blob) : setRenderError(true);
      } catch (err) {
        console.error("Receipt render failed:", err);
        if (alive) setRenderError(true);
      }
    }, 150);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [entry._id, render]);

  const saveFile = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const getImage = async () => image || (await render());

  const shareImage = async () => {
    if (busy) return;
    setNotice("");
    setBusy("share");
    try {
      const blob = await getImage();
      if (!blob) throw new Error("no image");
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        // Phone share sheet with the receipt image → pick WhatsApp
        await navigator.share({ files: [file], title: `Receipt ${entry.receiptNo}` });
      } else {
        // No file sharing (most desktops): save the image, then open the chat to attach it
        saveFile(blob);
        window.open(
          entry.mobile ? `https://wa.me/91${entry.mobile}` : "https://web.whatsapp.com/",
          "_blank",
          "noopener,noreferrer"
        );
        setNotice("Receipt image downloaded. Attach it in the WhatsApp chat that opened.");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Receipt share failed:", err);
        setNotice("Couldn't share the image. Use Download and send it from your gallery.");
      }
    } finally {
      setBusy(null);
    }
  };

  const download = async () => {
    if (busy) return;
    setNotice("");
    setBusy("download");
    try {
      const blob = await getImage();
      if (!blob) throw new Error("no image");
      saveFile(blob);
    } catch (err) {
      console.error("Receipt download failed:", err);
      setNotice("Couldn't create the image. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const preparing = !image && !renderError;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-6">
        <div ref={wrapRef} className="w-full max-w-[420px]">
          {/* ===== RECEIPT (scaled preview of the exported image) ===== */}
          <div
            className="mx-auto overflow-hidden rounded-2xl shadow-2xl bg-white"
            style={{ width: RECEIPT_W * scale, height: RECEIPT_H * scale }}
          >
            <ReceiptCard ref={cardRef} entry={entry} scale={scale} />
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={shareImage}
              disabled={busy !== null || preparing}
              className="w-full py-4 rounded-xl bg-[#25D366] text-[#0B3B1E] text-base font-semibold flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-70 cursor-pointer"
            >
              {busy === "share" || preparing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                  <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41" />
                </svg>
              )}
              {preparing ? "Preparing receipt…" : "Share on WhatsApp"}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={download}
                disabled={busy !== null}
                className="py-4 rounded-xl bg-white text-slate-900 text-base font-semibold flex items-center justify-center gap-2 active:bg-slate-100 disabled:opacity-70 cursor-pointer"
              >
                {busy === "download" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Download
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
            {notice && <p className="text-center text-sm text-white">{notice}</p>}
            {renderError && !notice && (
              <p className="text-center text-sm text-amber-200">
                Couldn&apos;t prepare the image yet — tap Share or Download to try again.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
