type SendWhatsAppResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export async function sendWhatsApp(
  mobile: string,
  name: string,
  event: string
): Promise<SendWhatsAppResponse> {
  try {
    const res = await fetch("/api/send-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, name, event }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send message");

    return { success: true, data };
  } catch (err: any) {
    console.error("sendWhatsApp error:", err.message);
    return { success: false, error: err.message };
  }
}
