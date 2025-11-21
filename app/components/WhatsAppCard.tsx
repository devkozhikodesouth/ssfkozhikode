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

const WhatsAppCard = ({
  name,
  mobile,
  ticket,
  handleImage,
}: WhatsAppCardProps) => {
  const qrRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [generatedFile, setGeneratedFile] = useState<File | null>(null);

  // Generate QR code
  useEffect(() => {
    if (!ticket) return;
    QRCode.toDataURL(String(ticket), { width: 260, margin: 1 }) // larger QR size
      .then((url) => {
        if (qrRef.current) qrRef.current.src = url;
      })
      .catch((err) => console.error("QR generation failed:", err));
  }, [mobile, ticket]);

  // Generate HD image
  useEffect(() => {
    if (!name || !mobile || !ticket) return;

    const timeout = setTimeout(async () => {
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          scale: 8, // HIGH QUALITY
          useCORS: true,
          logging: false,
        });

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png", 1.0)
        );

        if (blob) {
          const file = new File([blob], `${name}-ticket.png`, {
            type: "image/png",
          });
          setGeneratedFile(file);
          handleImage(file);
        }
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [name, mobile, ticket]);

  // Download image to device
  const downloadImage = () => {
    if (!generatedFile) return;
    const url = URL.createObjectURL(generatedFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = generatedFile.name;
    link.click();
  };

  // Share image using native share sheet
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
        alert("Sharing not supported on this device/browser");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* CARD */}
      <div
        ref={cardRef}
        className="relative shadow-xl rounded-2xl border border-gray-200"
        style={{
          width: "300px",
          height: "600px",
          backgroundImage: "url('/template.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p
          className="absolute font-bold"
          style={{
            top: "290px",
            left: "80px",
            color: Colors.accent,
            fontSize: "12px",
          }}
        >
          {ticket}
        </p>

        <p
          className="absolute font-medium"
          style={{
            top: "305px",
            left: "80px",
            width: "160px",
            color: Colors.primary,
            fontSize: "12px",
            lineHeight: "16px",
          }}
        >
          {name.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())}
        </p>

        <img
          ref={qrRef}
          alt="QR-code"
          className="absolute"
          style={{
            width: "120px",
            height: "120px",
            top: "338px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </div>

      {/* BUTTONS */}
      {generatedFile && (
        <div className="flex gap-3">
          <button
            style={{ backgroundColor: Colors.accent }}
            onClick={downloadImage}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg"
          >
            <Download size={18} /> Download
          </button>

          <button
            onClick={shareImage}
            style={{ backgroundColor: Colors.primaryDark }}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg"
          >
            <Share2 size={18} /> Share Image
          </button>
        </div>
      )}
    </div>
  );
};

export default WhatsAppCard;
