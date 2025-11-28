import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Sector from "@/app/models/Sector";
import Unit from "@/app/models/Unit";
import Student from "@/app/models/Students";


export async function GET() {
  try {
    await connectDB();
    const total = await Student.countDocuments();
     return NextResponse.json({ total }, { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;

    const limit = 10;
    const skip = (page - 1) * limit;

    const students = await Student.find({}, "name mobile").skip(skip).limit(limit).lean();

    if (students.length === 0) {
      return NextResponse.json({ finished: true, message: "No more students" }, { status: 200 });
    }

    let successCount = 0;
    let failedCount = 0;

    for (const student of students) {
      try {
        if (!student.mobile || student.mobile.length < 10) {
          failedCount++;
          continue;
        }

        const messagePayload = {
          messaging_product: "whatsapp",
          to: `91${student.mobile}`,
          type: "template",
          template: {
            name: "event_reminder",
            language: { code: "en" },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "document",
                    document: {
                      id: "1341641494367524",
                      filename: "Gala Brochure KKD South",
                    },
                  },
                ],
              },
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: student.name.toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase()),
                  },
                ],
              },
            ],
          },
        };

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

        const result = await res.json();

        if (!res.ok) {
          console.log("WhatsApp Error:", result);
          throw new Error(result.error?.details || result.error?.message || "Failed Message");
        }

        successCount++;
      } catch (err) {
        console.log("Failed:", student.mobile);
        failedCount++;
      }

      await new Promise((res) => setTimeout(res, 2000));
    }

    return NextResponse.json({ success: true, page, successCount, failedCount });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}