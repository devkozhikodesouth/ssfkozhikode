"use client";
import React, { useRef, useEffect } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";

type WhatsAppCardProps = {
  name: string;
  mobile: string | number;
  handleImage: (file: File) => void; // callback returns image file
};

const WhatsAppCard = ({ name, mobile, handleImage }: WhatsAppCardProps) => {
  const qrRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // ✅ Generate QR code
  useEffect(() => {
    QRCode.toDataURL(String(mobile), { width: 180, margin: 1 })
      .then((url) => {
        if (qrRef.current) qrRef.current.src = url;
      })
      .catch((err) => console.error("QR generation failed:", err));
  }, [mobile]);

  // ✅ Convert card to image file and send to parent
  useEffect(() => {
    if (!name || !mobile) return;
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
          handleImage(file); // pass file to parent
        }
      }
    }, 500); // wait for QR to render
    return () => clearTimeout(timer);
  }, [name, mobile]);

  return (
    <div
      ref={cardRef}
      style={{
        backgroundImage: "url('/template.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="relative w-[400px] h-[500px] bg-white shadow-xl rounded-2xl flex flex-col items-center justify-center text-center p-6 border border-gray-200"
    >
      <img ref={qrRef} alt="QR Code" className="w-24 h-24 mt-[225px]" />
      <div className="-mt-2 space-y-2">
        <p className="text-xl font-semibold text-white">{name}</p>
      </div>
    </div>
  );
};

export default WhatsAppCard;