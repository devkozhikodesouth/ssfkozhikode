"use client";

import React, { useRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { Colors } from "../constants/colors";
import { Download, Share2 } from "lucide-react";

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

  // Generate High Quality QR Code
  useEffect(() => {
    if (!ticket) return;
    QRCode.toDataURL(String(ticket), { width: 800, margin: 1 })
      .then((url) => qrRef.current && (qrRef.current.src = url))
      .catch((err) => console.error("QR generation failed:", err));
  }, [ticket]);

  // Capture HD Image for download/share
  useEffect(() => {
    if (!name || !mobile || !ticket) return;

    const timeout = setTimeout(async () => {
      if (!cardRef.current) return;

      setIsCapturing(true); // REMOVE SCALE BEFORE CAPTURE

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 6,
        backgroundColor: null,
      });

      setIsCapturing(false); // RESTORE SCALE

      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();

      const file = new File([blob], `${name}-ticket.png`, { type: "image/png" });
      setGeneratedFile(file);
      handleImage(file);
    }, 600);

    return () => clearTimeout(timeout);
  }, [name, mobile, ticket]);

  // Download HD Image
  const downloadImage = () => {
    if (!generatedFile) return;
    const url = URL.createObjectURL(generatedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = generatedFile.name;
    a.click();
  };

  // Share native sheet
  const shareImage = async () => {
    if (!generatedFile) return;

    try {
      const shareData = {
        files: [generatedFile],
        title: "SSF Gala Ticket",
        text: `🎟 Ticket for ${name} (${ticket})`,
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        alert("Sharing not supported");
      }
    } catch (err) {
      console.error(err);
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
            backgroundImage: "url('/template.png')",
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
     
        <div className="flex gap-4">
          <button
            onClick={downloadImage}
            style={{ backgroundColor: Colors.accent }}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg"
          >
            <Download size={18} />
            Download
          </button>

          <button
            onClick={shareImage}
            style={{ backgroundColor: Colors.primaryDark }}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>
   
    </div>
  );
};

export default WhatsAppCard;
