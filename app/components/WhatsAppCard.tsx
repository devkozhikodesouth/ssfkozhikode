"use client";
import React, { useRef, useEffect } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { Colors } from "../constants/colors";

type WhatsAppCardProps = {
  name: string;
  mobile: string | number;
  ticket?: string;
  handleImage: (file: File) => void;
};

const WhatsAppCard = ({ name, mobile,ticket, handleImage }: WhatsAppCardProps) => {
  const qrRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    QRCode.toDataURL(String(ticket), { width: 180, margin: 1 })
      .then((url) => {
        if (qrRef.current) qrRef.current.src = url;
      })
      .catch((err) => console.error("QR generation failed:", err));
  }, [mobile]);

  useEffect(() => {
    if (!name || !mobile|| !ticket) return;
    const timer = setTimeout(async () => {
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, { scale: 2 });
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (blob) {
          const file = new File([blob], `${name}-whatsapp-card.png`, {
            type: "image/png",
          });
          handleImage(file);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [name, mobile]);

  return (
    <div
      ref={cardRef}
      className="relative bg-white shadow-xl rounded-2xl border border-gray-200"
      style={{
        width: "300px",      // FIXED size
        height: "600px",     // FIXED size
        backgroundImage: "url('/template.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <p
        className="absolute font-semibold text-sm"
        style={{ top: "285px", left: "80px",color:Colors.accent,  }}
      >
        {ticket}
      </p>

      <p
        className="absolute font-medium"
        style={{ top: "300px", left: "80px",width: "160px", color:Colors.primary,  fontSize: "12px", lineHeight: "16px" }}
      >
        {name}
      </p>

      <img
        ref={qrRef}
        alt="QR-code"
        className="absolute "
        style={{
          width: "120px",
          height: "120px",
          top: "338px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
};

export default WhatsAppCard;
