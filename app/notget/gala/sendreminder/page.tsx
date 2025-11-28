"use client";
import { useState, useEffect } from "react";

export default function BulkSender() {
  const [page, setPage] = useState(1);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [total, setTotal] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      const res = await fetch("/api/admin/send-reminder");
      const data = await res.json();
      setTotal(data.total);
    }
    fetchCount();
  }, []);

const sendBatch = async () => {
  setSending(true);
  setStatus(`Sending batch ${page}...`);

  const res = await fetch(`/api/admin/send-reminder?page=${page}`, { method: "POST" });
  const data = await res.json();

  if (data.finished) {
    setStatus("🎉 All students have received the message");
    setSending(false);
    return;
  }

  if (data.success) {
    setSentCount((prev) => prev + data.successCount);
    setStatus(`✔ Batch ${page} completed. Success: ${data.successCount}, Failed: ${data.failedCount}`);
    setPage(page + 1);
  } else {
    setStatus("❌ Error sending messages");
  }

  setSending(false);
};

  const remaining = total - sentCount;
  const progress = total > 0 ? Math.round((sentCount / total) * 100) : 0;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-lg mx-auto text-center space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Bulk WhatsApp Sender</h2>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-green-600 h-4 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-gray-700 font-medium">
        Progress: <span className="text-green-600">{progress}%</span>
      </p>

      <p className="text-gray-700">
        Sent: <b>{sentCount}</b> / {total} <br />
        Remaining: <b>{remaining}</b>
      </p>

      <button
        onClick={sendBatch}
        disabled={sending || remaining <= 0}
        className={`px-6 py-3 rounded-xl font-semibold shadow
          ${remaining <= 0 ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 text-white"}
        `}
      >
        {sending ? "Sending..." : `Send Next 30 (Batch ${page})`}
      </button>

      <p className="text-sm text-gray-600">{status}</p>
    </div>
  );
}
