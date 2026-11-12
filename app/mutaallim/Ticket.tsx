"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Share2, Loader2 } from "lucide-react";
import { EVENT_NAME, type TicketData } from "@/app/utils/mutaallim";

/* The pass is drawn once on a canvas and shown as an image, so what people see
 * is exactly what they download or share (and the side notches are truly
 * transparent). Logical size 360×700, exported at 3× (1080×2100). */
const W = 360;
const H = 668;
const SPLIT = 318; // perforation line
const SCALE = 3;

const C = {
  ink: "#3B0A2A",
  ink2: "#5A1040",
  plumDeep: "#7A1A52",
  amber: "#F29F1F",
  gold: "#FAD764",
  cream: "#FFF7E6",
  parchment: "#FFE5A8",
  muted: "#6B4A5C",
};

const nextImg = (path: string, w: number) => `/_next/image?url=${encodeURIComponent(path)}&w=${w}&q=75`;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

async function drawTicket(t: TicketData, family: string): Promise<HTMLCanvasElement> {
  await Promise.all(
    [500, 700, 800].map((w) => document.fonts.load(`${w} 20px ${family}`, `${t.name} മുതഅല്ലിം MUT-0123`))
  );
  const [qrUrl, title, swoosh] = await Promise.all([
    QRCode.toDataURL(t.registrationCode, {
      errorCorrectionLevel: "Q",
      margin: 2, // quiet zone (modules) on top of the white padding below
      width: 560,
      color: { dark: C.ink, light: "#FFFFFF" },
    }),
    loadImage(nextImg("/content.webp", 750)),
    loadImage(nextImg("/elment1.webp", 640)),
  ]);
  const qr = await loadImage(qrUrl);

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "alphabetic";

  // Card silhouette
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 22);
  ctx.clip();

  const g = ctx.createLinearGradient(0, 0, W, SPLIT);
  g.addColorStop(0, C.ink);
  g.addColorStop(1, C.ink2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, SPLIT);
  ctx.fillStyle = C.cream;
  ctx.fillRect(0, SPLIT, W, H - SPLIT);

  // Decorative swoosh (element 1), top-right
  ctx.save();
  ctx.translate(W - 36, 8);
  ctx.rotate((8 * Math.PI) / 180);
  ctx.drawImage(swoosh, -120, -120, 240, 240 * (swoosh.height / swoosh.width));
  ctx.restore();

  // Title art
  const tw = 256;
  ctx.drawImage(title, (W - tw) / 2, 16, tw, tw * (title.height / title.width));

  ctx.textAlign = "center";
  ctx.fillStyle = C.gold;
  ctx.font = `700 11px ${family}`;
  ctx.letterSpacing = "3px";
  ctx.fillText("DELEGATE PASS", W / 2, 290);
  ctx.letterSpacing = "0px";

  // Perforation: real transparent notches + dashed line
  ctx.globalCompositeOperation = "destination-out";
  [0, W].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, SPLIT, 15, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = "source-over";
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = C.amber;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(28, SPLIT);
  ctx.lineTo(W - 28, SPLIT);
  ctx.stroke();
  ctx.setLineDash([]);

  // Name block
  const maxW = W - 56;
  ctx.textAlign = "left";
  ctx.fillStyle = C.muted;
  ctx.font = `700 10px ${family}`;
  ctx.letterSpacing = "2px";
  ctx.fillText("NAME", 28, 348);
  ctx.letterSpacing = "0px";

  let size = 28;
  ctx.font = `800 ${size}px ${family}`;
  while (size > 18 && ctx.measureText(t.name).width > maxW) {
    size -= 1;
    ctx.font = `800 ${size}px ${family}`;
  }
  ctx.fillStyle = C.plumDeep;
  ctx.fillText(fit(ctx, t.name, maxW), 28, 378);

  ctx.fillStyle = C.ink;
  ctx.font = `700 14px ${family}`;
  ctx.fillText(fit(ctx, t.campus, maxW), 28, 397);
  ctx.fillStyle = C.muted;
  ctx.font = `500 12px ${family}`;
  ctx.fillText(fit(ctx, `${t.division} · ${t.category}`, maxW), 28, 413);

  // QR in a white tile (padding + the code's own quiet zone)
  const box = 170;
  const bx = (W - box) / 2;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(bx, 434, box, box, 14);
  ctx.fill();
  ctx.strokeStyle = C.parchment;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qr, bx + 8, 442, box - 16, box - 16);
  ctx.imageSmoothingEnabled = true;

  // Code
  ctx.textAlign = "center";
  ctx.fillStyle = C.muted;
  ctx.font = `700 9px ${family}`;
  ctx.letterSpacing = "2px";
  ctx.fillText("REGISTRATION CODE", W / 2, 624);
  ctx.fillStyle = C.plumDeep;
  ctx.font = `800 22px ${family}`;
  ctx.letterSpacing = "2px";
  ctx.fillText(t.registrationCode, W / 2, 650);
  ctx.restore();

  return canvas;
}

export default function Ticket({ ticket }: { ticket: TicketData }) {
  const probe = useRef<HTMLSpanElement>(null);
  const [src, setSrc] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [failed, setFailed] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => setCanShare(typeof navigator !== "undefined" && !!navigator.share), []);

  useEffect(() => {
    let live = true;
    setSrc("");
    setBlob(null);
    setFailed(false);
    const family = probe.current ? getComputedStyle(probe.current).fontFamily : "sans-serif";
    drawTicket(ticket, family)
      .then((canvas) => {
        if (!live) return;
        setSrc(canvas.toDataURL("image/png"));
        canvas.toBlob((b) => live && setBlob(b), "image/png");
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [ticket]);

  const filename = `${ticket.registrationCode}-ticket.png`;

  const download = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const share = async () => {
    if (!blob) return;
    setBusy(true);
    try {
      const file = new File([blob], filename, { type: "image/png" });
      const data: ShareData = {
        title: `${EVENT_NAME} — ${ticket.registrationCode}`,
        text: `My pass for ${EVENT_NAME}, Mukkam. Code: ${ticket.registrationCode}`,
      };
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ ...data, files: [file] });
      else await navigator.share(data);
    } catch (e: any) {
      if (e?.name !== "AbortError") download(); // share unavailable/failed: still give them the file
    } finally {
      setBusy(false);
    }
  };

  const btn =
    "inline-flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-base font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mut-plum-deep disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer active:scale-[0.98]";

  return (
    <div className="mx-auto w-full max-w-[300px]">
      <span ref={probe} aria-hidden className="sr-only" style={{ fontFamily: "var(--nf-mut-display), sans-serif" }} />

      {/* aspect-ratio reserves the space: no layout shift while the pass renders */}
      <div className="relative w-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.35)]" style={{ aspectRatio: `${W} / ${H}` }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            width={W}
            height={H}
            alt={`Pass for ${ticket.name}. Registration code ${ticket.registrationCode}. ${ticket.campus}, ${ticket.division}. Category ${ticket.category}.`}
            className="h-full w-full"
          />
        ) : (
          <div role="status" className="grid h-full w-full place-items-center rounded-[22px] bg-mut-ink-2/60 text-mut-parchment">
            {failed ? (
              <p className="px-6 text-center text-sm">
                Could not draw the pass image. Your code is <b className="text-mut-gold">{ticket.registrationCode}</b>.
              </p>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Preparing your pass…
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={download} disabled={!blob} className={`${btn} bg-mut-gold text-mut-ink hover:bg-mut-parchment`}>
          <Download className="h-5 w-5" aria-hidden /> Download ticket
        </button>
        {canShare && (
          <button type="button" onClick={share} disabled={!blob || busy} className={`${btn} border-2 border-mut-parchment/70 text-mut-cream hover:bg-white/10`}>
            {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Share2 className="h-5 w-5" aria-hidden />} Share
          </button>
        )}
      </div>
    </div>
  );
}
