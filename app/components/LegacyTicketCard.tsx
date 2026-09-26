"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { Download, Loader2 } from "lucide-react";

type LegacyTicketCardProps = {
  name: string;
  mobile: string | number;
  ticket?: string;
  division?: string | null;
  sector?: string | null;
  handleImage: (file: File) => void;
};

const CARD_WIDTH = 639;
const CARD_HEIGHT = 1017;

const LegacyTicketCard = ({
  name,
  mobile,
  ticket,
  division,
  sector,
  handleImage,
}: LegacyTicketCardProps) => {
  const qrRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [scale, setScale] = useState(0.25);

  /*
   * Responsive preview scale
   * Real ticket always remains 639 × 1017
   */
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const parentWidth =
        containerRef.current.clientWidth ||
        containerRef.current.parentElement?.clientWidth ||
        320;

      // Full available width on mobile, capped at 380px on desktop
      const previewWidth = Math.min(parentWidth, 380);

      setScale(previewWidth / CARD_WIDTH);
    };

    updateScale();

    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  /*
   * Generate QR Code
   */
  useEffect(() => {
    if (!ticket) return;

    QRCode.toDataURL(String(ticket), {
      width: 800,
      margin: 1,
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        if (qrRef.current) {
          qrRef.current.src = url;
        }
      })
      .catch((error) => {
        console.error("QR generation failed:", error);
      });
  }, [ticket]);

  /*
   * Create a clean 639 × 1017 canvas
   * without including the CSS preview scale.
   */
  const captureTicket = async (captureScale = 2) => {
    if (!cardRef.current) return null;

    const canvas = await html2canvas(cardRef.current, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,

      /*
       * 639 × 1017 element
       * scale: 3 gives a very high quality export.
       */
      scale: captureScale,

      width: CARD_WIDTH,
      height: CARD_HEIGHT,

      /*
       * Remove preview transform from cloned DOM
       * before html2canvas renders it.
       */
      onclone: (clonedDocument) => {
        const clonedCard = clonedDocument.querySelector(
          '[data-ticket-card="true"]'
        ) as HTMLElement | null;

        if (clonedCard) {
          clonedCard.style.transform = "none";
          clonedCard.style.transformOrigin = "top left";
        }
      },
    });

    return canvas;
  };

  /*
   * Automatically generate image for WhatsApp / sharing
   */
  useEffect(() => {
    if (!name || !mobile || !ticket) return;

    const timeout = window.setTimeout(async () => {
      try {
        /*
         * Wait until QR image has finished loading.
         */
        if (qrRef.current && !qrRef.current.complete) {
          await new Promise<void>((resolve) => {
            if (!qrRef.current) {
              resolve();
              return;
            }

            qrRef.current.onload = () => resolve();
            qrRef.current.onerror = () => resolve();
          });
        }

        const canvas = await captureTicket(3);

        if (!canvas) return;

        canvas.toBlob(
          (blob) => {
            if (!blob) return;

            const safeName = name
              .trim()
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "_");

            const file = new File(
              [blob],
              `${safeName || "Ticket"}_Its_our_Legacy_Ticket.png`,
              {
                type: "image/png",
              }
            );

            handleImage(file);
          },
          "image/png",
          1
        );
      } catch (error) {
        console.error("Ticket generation failed:", error);
      }
    }, 600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [name, mobile, ticket, handleImage]);

  /*
   * Download Ticket
   */
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;

    try {
      setIsDownloading(true);

      const canvas = await captureTicket(3);

      if (!canvas) return;

      const dataUrl = canvas.toDataURL("image/png", 1);

      const safeName = name
        ? name
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "_")
        : "Ticket";

      const link = document.createElement("a");

      link.href = dataUrl;
      link.download = `${safeName}_Its_our_Legacy_Ticket.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download ticket image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formattedName = name ? toTitleCase(name) : "";

  /*
   * All colours inside the card are inline hex values:
   * html2canvas cannot parse Tailwind v4 oklch() colours.
   */
  const display = "var(--font-legacy-display), Orbitron, sans-serif";
  const body = "var(--font-legacy-body), Montserrat, sans-serif";

  return (
    <div
      ref={containerRef}
      className="flex w-full flex-col items-center gap-4"
    >
      {/* RESPONSIVE PREVIEW */}
      <div
        className="overflow-hidden rounded-xl shadow-md"
        style={{
          width: `${CARD_WIDTH * scale}px`,
          height: `${CARD_HEIGHT * scale}px`,
        }}
      >
        {/* REAL 639 × 1017 CARD */}
        <div
          ref={cardRef}
          data-ticket-card="true"
          style={{
            position: "relative",
            overflow: "hidden",
            width: `${CARD_WIDTH}px`,
            height: `${CARD_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            backgroundImage: "url('/legacyticket.webp')",
            backgroundSize: `${CARD_WIDTH}px ${CARD_HEIGHT}px`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top left",
            fontFamily: body,
          }}
        >
          {/* QR CODE (inside the white frame) */}
          <img
            ref={qrRef}
            alt={`QR code for ticket ${ticket || ""}`}
            crossOrigin="anonymous"
            style={{
              position: "absolute",
              width: "214px",
              height: "214px",
              top: "443px",
              left: "213px",
              objectFit: "contain",
            }}
          />

          {/* TICKET NUMBER */}
          <p
            style={{
              position: "absolute",
              top: "712px",
              left: 0,
              width: `${CARD_WIDTH}px`,
              margin: 0,
              textAlign: "center",
              fontFamily: display,
              fontWeight: 900,
              fontSize: "34px",
              lineHeight: 1,
              letterSpacing: "3px",
              color: "#D6229F",
            }}
          >
            {ticket}
          </p>

          {/* NAME */}
          <p
            style={{
              position: "absolute",
              top: "760px",
              left: "40px",
              width: `${CARD_WIDTH - 80}px`,
              margin: 0,
              textAlign: "center",
              fontSize: "30px",
              fontWeight: 700,
              lineHeight: "38px",
              color: "#2A0A5E",
            }}
          >
            {formattedName}
          </p>

          {/* DIVISION • SECTOR (small) */}
          {(division || sector) && (
            <p
              style={{
                position: "absolute",
                top: "846px",
                left: "40px",
                width: `${CARD_WIDTH - 80}px`,
                margin: 0,
                textAlign: "center",
                fontSize: "18px",
                fontWeight: 600,
                lineHeight: "24px",
                letterSpacing: "0.5px",
                color: "black",
              }}
            >
              {[division && `${division} Division`, sector && `${sector} Sector`]
                .filter(Boolean)
                .join("  •  ")}
            </p>
          )}
        </div>
      </div>

      {/* DOWNLOAD BUTTON */}
      <div className="mt-2 flex justify-center gap-3">
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className="
            flex cursor-pointer items-center gap-2
            rounded-xl
            bg-gradient-to-r from-[#A712AA] via-[#D6229F] to-[#E415A3]
            px-7 py-3
            text-sm font-medium text-white
            shadow-lg shadow-[#D6229F]/30
            transition
            hover:from-[#D6229F] hover:to-[#E415A3]
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-75
            sm:text-base
          "
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>Download Ticket</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LegacyTicketCard;
