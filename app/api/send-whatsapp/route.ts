// const sendMessage=await fetch("/api/send-whatsapp", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     phone: formData.mobile,
//     message: `Hello ${formData.name},

// Your registration for the Students’ Gala has been successfully completed! 🎉

// We’re excited to invite you to join us for this inspiring event, happening on November 29 at Kadalundi.
// Get ready to experience a day filled with learning, creativity, and togetherness!

// Warm regards,  
// SSF Kozhikode South District Committee`,
//   }),
// });


import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const phone = body?.phone?.toString?.();
  const message = body?.message?.toString?.();

  // Basic input validation
  if (!phone || !phone.trim()) {
    return NextResponse.json({ success: false, error: "'phone' is required" }, { status: 400 });
  }
  if (!message || !message.trim()) {
    return NextResponse.json({ success: false, error: "'message' is required" }, { status: 400 });
  }

  // Ensure environment variables are present
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  console.log(phoneNumberId,accessToken)
  if (!phoneNumberId || !accessToken) {
    console.error("Missing Meta/WhatsApp environment variables.", { phoneNumberId, hasToken: !!accessToken });
    return NextResponse.json({ success: false, error: "Server misconfiguration" }, { status: 500 });
  }

    try {
    const res = await axios.post(
      `https://graph.facebook.com/v24.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone.startsWith("+") ? phone : `+91${phone}`, // add country code if missing
        type: "text",
        text: {
          preview_url: true,
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
console.log(res.data)
    return NextResponse.json({ success: true, data: res.data });
  }catch (err: any) {
    // Axios error objects often contain useful debugging info
    const details = err?.response?.data || err?.message || String(err);
    console.error("Failed sending WhatsApp message:", details);
    return NextResponse.json({ success: false, error: "Failed to send message", details }, { status: 502 });
  }
}