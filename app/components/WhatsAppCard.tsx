"use client";

import React, { useRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { Colors } from "../constants/colors";
import { Download, Loader2 } from "lucide-react";

type WhatsAppCardProps = {
  name: string;
  mobile: string | number;
  ticket?: string;
  handleImage: (file: File) => void;
};

const WhatsAppCard = ({ name, mobile, ticket, handleImage }: WhatsAppCardProps) => {
  const qrRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [generatedFile, setGeneratedFile] = useState<File | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Generate High Quality QR Code
  useEffect(() => {
    if (!ticket) return;
    QRCode.toDataURL(String(ticket), { width: 800, margin: 1 })
      .then((url) => qrRef.current && (qrRef.current.src = url))
      .catch((err) => console.error("QR generation failed:", err));
  }, [ticket]);

  // Capture HD Image for export
  useEffect(() => {
    if (!name || !mobile || !ticket) return;

    const timeout = setTimeout(async () => {
      if (!cardRef.current) return;

      setIsCapturing(true);

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 6,
        backgroundColor: null,
      });

      setIsCapturing(false);

      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();

      const file = new File([blob], `${name}-ticket.png`, { type: "image/png" });
      setGeneratedFile(file);
      handleImage(file);
    }, 600);

    return () => clearTimeout(timeout);
  }, [name, mobile, ticket]);

  // Download Ticket as Image
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 4,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      const safeName = name ? name.trim().replace(/\s+/g, "_") : "Ticket";
      link.download = `${safeName}_Grand_Conclave_26_Ticket.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download ticket image:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* PREVIEW WRAPPER */}
      <div style={{ width: "300px", height: "600px", overflow: "hidden" }}>
        {/* REAL CARD (HD SIZE FOR EXPORT) */}
        <div
          ref={cardRef}
          className="relative shadow-xl rounded-2xl border border-gray-200"
          style={{
            width: "600px",
            height: "1200px",
            transform: "scale(0.5)",
            transformOrigin: "top left",
            backgroundImage: "url('/grandconclave26ticket.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* TICKET NO */}
          <p
            className="absolute font-bold"
            style={{
              top: "570px",
              left: "150px",
              fontSize: "25px",
              color: Colors.accent,
            }}
          >
            {ticket}
          </p>

          {/* NAME */}
          <p
            className="absolute font-medium"
            style={{
              top: "600px",
              left: "150px",
              width: "360px",
              fontSize: "25px",
              lineHeight: "32px",
              color: Colors.primary,
            }}
          >
            {name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
          </p>

          {/* QR */}
          <img
            ref={qrRef}
            alt="QR"
            className="absolute"
            style={{
              width: "250px",
              height: "250px",
              top: "675px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-center gap-3 mt-2">
        <button
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-7 py-3 rounded-xl font-medium text-sm sm:text-base shadow-lg shadow-purple-600/30 transition active:scale-95 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
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
