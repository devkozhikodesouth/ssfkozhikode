"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { Download, Loader2 } from "lucide-react";

type WhatsAppCardProps = {
  name: string;
  mobile: string | number;
  ticket?: string;
  handleImage: (file: File) => void;
};

const CARD_WIDTH = 1920;
const CARD_HEIGHT = 1080;

const WhatsAppCard = ({
  name,
  mobile,
  ticket,
  handleImage,
}: WhatsAppCardProps) => {
  const qrRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [scale, setScale] = useState(0.25);

  /*
   * Responsive preview scale
   * Real ticket always remains 1920 × 1080
   */
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const parentWidth =
        containerRef.current.parentElement?.clientWidth || 320;

      const availableWidth = Math.max(parentWidth - 32, 280);
      const previewWidth = Math.min(availableWidth, 700);

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
   * Create a clean 1920 × 1080 canvas
   * without including the CSS preview scale.
   */
  const captureTicket = async (captureScale = 2) => {
    if (!cardRef.current) return null;

    const canvas = await html2canvas(cardRef.current, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,

      /*
       * 1920 × 1080 element
       * scale: 2 gives a very high quality export.
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

        const canvas = await captureTicket(2);

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
              `${safeName || "Ticket"}_Grand_Conclave_26_Ticket.png`,
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

      const canvas = await captureTicket(2);

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
      link.download = `${safeName}_Grand_Conclave_26_Ticket.png`;

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
  return (
    <div
      ref={containerRef}
      className="flex w-full flex-col items-center gap-4"
    >
      {/* RESPONSIVE PREVIEW */}
      <div
        className="overflow-hidden rounded-xl"
        style={{
          width: `${CARD_WIDTH * scale}px`,
          height: `${CARD_HEIGHT * scale}px`,
        }}
      >
        {/* REAL 1920 × 1080 CARD */}
        <div
          ref={cardRef}
          data-ticket-card="true"
          className="relative overflow-hidden"
          style={{
            width: `${CARD_WIDTH}px`,
            height: `${CARD_HEIGHT}px`,

            transform: `scale(${scale})`,
            transformOrigin: "top left",

            backgroundImage: "url('/grandconclave26ticket.webp')",
            backgroundSize: "1920px 1080px",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top left",
          }}
        >
          {/* TICKET NUMBER */}
          <p
            className="absolute font-bold"
            style={{
              top: "580px",
              left: "1235px",

              margin: 0,

              fontSize: "50px",
              lineHeight: 1,

              color: "red",
            }}
          >
            {ticket}
          </p>

          {/* NAME */}
          <p
            className="absolute font-medium text-blue-900"
            style={{
              top: "650px",
              left: "950px",
              textAlign: "center",
              justifyContent:'center',
              justifyItems:'center',
              width: "800px",
              margin: 0,
              fontSize: "40px",
              lineHeight: "56px",

              color: "#000",
            }}
          >
            {formattedName}
          </p>


          {/* QR CODE */}
          <img
            ref={qrRef}
            alt={`QR code for ticket ${ticket || ""}`}
            crossOrigin="anonymous"
            className="absolute"
            style={{
              width: "300px",
              height: "300px",
              top: "280px",
              left: "1200px",
              objectFit: "contain",
            }}
          />
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
            bg-gradient-to-r from-purple-600 to-indigo-600
            px-7 py-3
            text-sm font-medium text-white
            shadow-lg shadow-purple-600/30
            transition
            hover:from-purple-500 hover:to-indigo-500
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

export default WhatsAppCard;