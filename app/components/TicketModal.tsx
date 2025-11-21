"use client";

import React, { useState } from "react";
import WhatsAppCard from "./WhatsAppCard";

interface TicketModalProps {
  open: boolean;
  onClose: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ open, onClose }) => {
  const [mobile, setMobile] = useState("");
  const [foundUser, setFoundUser] = useState<{
    name: string;
    mobile: string;
    ticket: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setFoundUser(null);

    try {
      const res = await fetch("/api/gala/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const result = await res.json();

      if (result.success) {
        setFoundUser(result.data);
      } else {
        setError("❌ Not registered");
      }
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-11/12 sm:w-1/2 shadow-lg relative">
            <h2 className="text-xl font-bold mb-4 text-center">Get Your Tickets 🎫</h2>

            {!foundUser && (
              <>
                <input
                  type="text"
                  placeholder="Enter your mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full p-3 border rounded-lg mb-3 outline-none focus:ring-2 focus:ring-yellow-400"
                />

                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

                <button
                  onClick={handleSearch}
                  className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:brightness-95"
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </>
            )}

            {foundUser && (
              <div className="flex justify-center mt-4">
                <WhatsAppCard
                  name={foundUser.name}
                  mobile={foundUser.mobile}
                  ticket={foundUser.ticket||""}
                  handleImage={() => {}}
                />
              </div>
            )}

            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketModal;
