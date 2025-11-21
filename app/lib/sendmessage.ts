
type SendWhatsAppResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export async function sendWhatsApp(
  name: string,
  mobile: string,
  ticket: string
): Promise<SendWhatsAppResponse> {
  try {
    const res = await fetch("/api/send-whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // ✅ Important
      },
      body: JSON.stringify({ mobile, name ,ticket}), // ✅ Must stringify
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send message");

    return { success: true, data };
  } catch (err: any) {
    console.error("sendWhatsApp error:", err.message);
    return { success: false, error: err.message };
  }
}
