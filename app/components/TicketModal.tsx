"use client";

import React, { useState, useEffect } from "react";
import WhatsAppCard from "./WhatsAppCard";
import { Colors } from "../constants/colors";

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

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setMobile("");
      setFoundUser(null);
      setError("");
      setLoading(false);
    }
  }, [open]);

  const handleSearch = async () => {
    if (!mobile) {
      setError("Please enter a valid mobile number");
      return;
    }

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
        setError("❌ Mobile not registered");
      }
    } catch {
      setError("Server error, please try again");
    }

    setLoading(false);
  };

  const handleClose = () => {
    setMobile("");
    setFoundUser(null);
    setError("");
    setLoading(false);
    onClose();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-11/12 sm:w-1/2 shadow-lg relative">

            <h2 className="text-xl font-bold mb-4 text-center">Get Your Ticket 🎫</h2>

            {!foundUser && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
              >
                <input
                  type="text"
                  placeholder="Enter your mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full p-3 border rounded-lg mb-3 outline-none focus:ring-2 focus:ring-yellow-400"
                />

                {error && (
                  <div role="alert" className="alert alert-warning mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 shrink-0 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                    style={{ backgroundColor: Colors.accent }}
                  className="w-full text-white py-3 rounded-lg font-semibold hover:brightness-95"
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </form>
            )}

            {foundUser && (
              <div className="flex justify-center mt-4">
                <WhatsAppCard
                  name={foundUser.name}
                  mobile={foundUser.mobile}
                  ticket={foundUser.ticket}
                  handleImage={() => {}}
                />
              </div>
            )}

            <button
              onClick={handleClose}
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
