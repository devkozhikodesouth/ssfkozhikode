import type { NextRequest } from "next/server";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export async function POST(req: NextRequest) {
  if (!process.env.PHONE_NUMBER_ID || !process.env.META_ACCESS_TOKEN) {
    console.error("Missing environment variables: PHONE_NUMBER_ID or META_ACCESS_TOKEN");
    return new Response(JSON.stringify({ error: "Server configuration error." }), {
      status: 500,
    });
  }

  let filePath: string | null = null;

  try {
    const { mobile, name, ticket } = await req.json();
    console.log(ticket)

const sendName = name
  .toLowerCase()
  .replace(/\b\w/g, (char: string) => char.toUpperCase());


    // // Static image path
    // filePath = path.join(process.cwd(), "public", "success.png");

    // // Multipart for media upload
    // const formData = new FormData();
    // formData.append("messaging_product", "whatsapp");
    // formData.append("type", "image/png");
    // formData.append("file", fs.createReadStream(filePath));

    // // Upload image to WhatsApp Cloud media API
    // const mediaRes = await fetch(
    //   `https://graph.facebook.com/v17.0/${process.env.PHONE_NUMBER_ID}/media`,
    //   {
    //     method: "POST",
    //     headers: {
    //       Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
    //       ...formData.getHeaders(),
    //     },
    //     body: formData as any,
    //   }
    // );

    // const mediaData: any = await mediaRes.json();
    // console.log("Media upload response:", mediaData);

    // if (!mediaRes.ok || !mediaData.id) {
    //   console.error("Media upload failed:", mediaData);
    //   return new Response(JSON.stringify({ error: mediaData }), { status: 500 });
    // }

    // const mediaId = mediaData.id;
    const mediaId = '2289585044841032'

    // WhatsApp template message
    const messagePayload = {
      messaging_product: "whatsapp",
      to: `91${mobile}`,
      type: "template",
      template: {
        name: "success_gala_register_utility",
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
              { type: "text", text: sendName },
              { type: "text", text: ticket||"KS100" },
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
    console.log("Message response:", messageData);

    if (!messageRes.ok) {
      console.error("Message send failed:", messageData);
      return new Response(JSON.stringify({ error: messageData }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        mediaId,
        message: "Message sent successfully",
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Server Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
