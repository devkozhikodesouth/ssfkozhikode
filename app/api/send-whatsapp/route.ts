import type { NextRequest } from "next/server";
import QRCode from "qrcode";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // ✅ crucial for multipart upload support

export async function POST(req: NextRequest) {
  // 1️⃣ Check environment variables
  if (!process.env.PHONE_NUMBER_ID || !process.env.META_ACCESS_TOKEN) {
    console.error("Missing environment variables: PHONE_NUMBER_ID or META_ACCESS_TOKEN");
    return new Response(
      JSON.stringify({ error: "Server configuration error." }),
      { status: 500 }
    );
  }

  let filePath: string | null = null;

  try {
    const { mobile, name, event } = await req.json();

    // 2️⃣ Generate QR Code and save it temporarily
    const fileName = `QR_${mobile}.png`;
    filePath = path.join("/tmp", fileName); // safe for Vercel/Node serverless
    await QRCode.toFile(filePath, `Mobile: ${mobile}\nName: ${name}\nEvent: ${event}`);

    // 3️⃣ Prepare multipart/form-data (order matters!)
    const formData = new FormData();
    formData.append("messaging_product", "whatsapp"); // must be first
    formData.append("type", "image/png");
    formData.append("file", fs.createReadStream(filePath));

    // 4️⃣ Upload QR image to Meta’s /media endpoint
    const mediaRes = await fetch(
      `https://graph.facebook.com/v17.0/${process.env.PHONE_NUMBER_ID}/media`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
          ...formData.getHeaders(), // includes correct multipart boundary
        },
        body: formData as any,
      }
    );

    const mediaData :any= await mediaRes.json();
    console.log("Media response:", mediaData);

    if (!mediaRes.ok || !mediaData.id) {
      console.error("Error uploading media:", mediaData);
      return new Response(JSON.stringify({ error: mediaData }), { status: 500 });
    }

    const mediaId = mediaData.id;

    // 5️⃣ Send WhatsApp message using the uploaded media ID
    const messagePayload = {
      messaging_product: "whatsapp",
      to: `91${mobile}`,
      type: "template",
      template: {
        name: "gala_registered_succes_message",
        language: { code: "en" },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "image",
                image: { id: mediaId },
              },
            ],
          },
          {
            type: "body",
            parameters: [
              { type: "text", text: name },
            ],
          },
        ],
      },
    };


    const messageRes = await fetch(
      `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messagePayload),
      }
    );

    const messageData = await messageRes.json();
console.log(mediaData)
    if (!messageRes.ok) {
      console.error("Error sending message:", messageData);
      return new Response(JSON.stringify({ error: messageData }), { status: 500 });
    }

    // 6️⃣ Cleanup temporary file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      filePath = null;
    }

    return new Response(
      JSON.stringify({
        success: true,
        mediaId,

      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Server error:", error);

    // Cleanup on failure
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error("Failed to clean up temporary file:", cleanupError);
      }
    }

    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
