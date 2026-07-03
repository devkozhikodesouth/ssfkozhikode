import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes

interface Contact {
  name: string;
  mobile: string;
}

/**
 * headerType: "image" | "document" | "none"
 * bodyParams: number of {{N}} variables in body (default: 1 = just name)
 * languageCode: WhatsApp language code (default: "en")
 */
export async function POST(req: NextRequest) {
  if (!process.env.PHONE_NUMBER_ID || !process.env.META_ACCESS_TOKEN) {
    return new Response(
      JSON.stringify({ error: "Missing META credentials in .env" }),
      { status: 500 }
    );
  }

  const body = await req.json();
  const {
    contacts,
    templateName,
    mediaId,
    headerType = "image",   // "image" | "document" | "none"
    languageCode = "en",
    delayMs = 1500,
  }: {
    contacts: Contact[];
    templateName: string;
    mediaId?: string;
    headerType?: string;
    languageCode?: string;
    delayMs?: number;
  } = body;

  if (!contacts || contacts.length === 0) {
    return new Response(JSON.stringify({ error: "No contacts provided" }), {
      status: 400,
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let successCount = 0;
      let failedCount = 0;
      const total = contacts.length;

      send({ type: "start", total });

      for (let i = 0; i < contacts.length; i++) {
        const { name, mobile } = contacts[i];
        console.log(name,mobile)

        // ── Validate mobile ──────────────────────────────────────────────
        const cleanMobile = String(mobile).replace(/\D/g, "").slice(-10);
        if (cleanMobile.length < 10) {
          failedCount++;
          send({
            type: "progress",
            index: i + 1,
            total,
            name,
            mobile,
            status: "failed",
            reason: "Invalid mobile number",
            successCount,
            failedCount,
          });
          continue;
        }

        const sendName = name
          .toLowerCase()
          .replace(/\b\w/g, (c: string) => c.toUpperCase());

        // ── Build components ─────────────────────────────────────────────
        const components: any[] = [];

        // Header component — ONE parameter only
        if (headerType === "image" && mediaId) {
          components.push({
            type: "header",
            parameters: [{ type: "image", image: { id: mediaId } }],
          });
        } else if (headerType === "document" && mediaId) {
          components.push({
            type: "header",
            parameters: [
              {
                type: "document",
                document: { id: mediaId, filename: "Document" },
              },
            ],
          });
        }
        // "none" → no header component at all

        // Body component — name as {{name}} (named variable template)
        components.push({
          type: "body",
          parameters: [{ type: "text", parameter_name: "name", text: sendName }],
        });

        // ── Build full payload ───────────────────────────────────────────
        const messagePayload = {
          messaging_product: "whatsapp",
          to: `91${cleanMobile}`,
          type: "template",
          template: {
            name: templateName,
            language: { code: languageCode },
            components,
          },
        };

        try {
          const res = await fetch(
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

          const result: any = await res.json();
          console.log(`[${i + 1}/${total}] ${cleanMobile} →`, JSON.stringify(result));

          if (!res.ok) {
            failedCount++;
            // Surface the detailed Meta error to the UI
            const metaError =
              result?.error?.error_data?.details ||
              result?.error?.message ||
              `Code ${result?.error?.code || "unknown"}`;

            send({
              type: "progress",
              index: i + 1,
              total,
              name: sendName,
              mobile: cleanMobile,
              status: "failed",
              reason: metaError,
              successCount,
              failedCount,
            });
          } else {
            successCount++;
            send({
              type: "progress",
              index: i + 1,
              total,
              name: sendName,
              mobile: cleanMobile,
              status: "sent",
              successCount,
              failedCount,
            });
          }
        } catch (err: any) {
          failedCount++;
          send({
            type: "progress",
            index: i + 1,
            total,
            name: sendName,
            mobile: cleanMobile,
            status: "failed",
            reason: err.message || "Network error",
            successCount,
            failedCount,
          });
        }

        if (i < contacts.length - 1) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }

      send({ type: "done", total, successCount, failedCount });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
