"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { whatsappUrl } from "@/app/utils/fund";

const SHEET_MS = 250;

export type ShareRequest = {
  title: string;
  message: string;
  mobile?: string | null; // opens that chat directly when present
};

/* Render WhatsApp *bold* and _italic_ so the preview matches what is sent */
function formatLine(line: string) {
  const parts = line.split(/(\*[^*\n]+\*|_[^_\n]+_)/g);
  return parts.map((p, i) => {
    if (/^\*[^*]+\*$/.test(p)) return <strong key={i}>{p.slice(1, -1)}</strong>;
    if (/^_[^_]+_$/.test(p)) return <em key={i}>{p.slice(1, -1)}</em>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export default function SharePreview({
  request,
  onClose,
}: {
  request: ShareRequest;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);

  const close = useCallback(() => {
    setShown(false);
    window.setTimeout(onClose, SHEET_MS);
  }, [onClose]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [close]);

  const send = () => {
    window.open(whatsappUrl(request.message, request.mobile), "_blank", "noopener,noreferrer");
    close();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(request.message);
    } catch {
      // Older Android WebViews: fall back to a hidden textarea
      const ta = document.createElement("textarea");
      ta.value = request.message;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        onClick={close}
        className={`absolute inset-0 bg-slate-900/60 transition-opacity duration-[250ms] ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-preview-title"
        className={`absolute inset-x-0 bottom-0 max-h-[92vh] flex flex-col bg-white rounded-t-3xl shadow-xl transition-transform duration-[250ms] ease-out
          sm:inset-x-auto sm:left-1/2 sm:bottom-auto sm:top-1/2 sm:w-[440px] sm:rounded-3xl
          ${shown ? "translate-y-0 sm:-translate-x-1/2 sm:-translate-y-1/2" : "translate-y-full sm:-translate-x-1/2 sm:translate-y-[60vh]"}`}
      >
        <div className="sm:hidden pt-2.5 flex justify-center">
          <span className="w-10 h-1.5 rounded-full bg-slate-300" />
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="min-w-0">
            <h2 id="share-preview-title" className="text-lg font-semibold text-slate-900">
              Preview · {request.title}
            </h2>
            <p className="text-xs text-slate-500">
              {request.mobile
                ? `Opens chat with +91 ${request.mobile}`
                : "You'll choose a contact in WhatsApp"}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="p-2.5 -mr-2 rounded-xl text-slate-500 active:bg-slate-100 cursor-pointer"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp-style chat bubble */}
        <div className="flex-1 overflow-y-auto bg-[#EFEAE2] px-3 py-4">
          <div className="ml-auto max-w-[92%] rounded-xl rounded-tr-sm bg-[#D9FDD3] px-3 py-2 shadow-sm">
            <div className="text-[15px] leading-relaxed text-[#111B21] whitespace-pre-wrap break-words">
              {request.message.split("\n").map((line, i) => (
                <div key={i}>{line ? formatLine(line) : " "}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2.5 border-t border-slate-100 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={send}
            className="w-full py-4 rounded-xl bg-[#25D366] text-[#0B3B1E] text-base font-semibold flex items-center justify-center gap-2 active:opacity-80 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
              <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41" />
            </svg>
            Send on WhatsApp
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={copy}
              className="py-3.5 rounded-xl border border-slate-300 text-slate-800 text-sm font-semibold flex items-center justify-center gap-2 active:bg-slate-100 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-[#15803D]" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy text"}
            </button>
            <button
              type="button"
              onClick={close}
              className="py-3.5 rounded-xl bg-slate-100 text-slate-800 text-sm font-semibold active:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
