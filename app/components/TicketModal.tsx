"use client";

import React, { useState, useEffect } from "react";
import WhatsAppCard from "./WhatsAppCard";
import { Colors } from "../constants/colors";
import { useRouter } from "next/navigation";

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
  const [imageLoading, setImageLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!open) {
      setMobile("");
      setFoundUser(null);
      setError("");
      setLoading(false);
      setImageLoading(false);
      setShowCard(false);
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
        setShowCard(false);
        setImageLoading(true);

        // ✨ TIMEOUT LOADING (SHOW AFTER DELAY)
        setTimeout(() => {
          setShowCard(true);
          setImageLoading(false);
        }, 2000); // Change delay if needed (ms)
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
    setImageLoading(false);
    setShowCard(false);
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
                  onChange={(e) => {
                    setMobile(e.target.value);
                    setError("");
                  }}
                  className="w-full p-3 border rounded-lg mb-3 outline-none focus:ring-2 focus:ring-yellow-400"
                />

                {error && (
                  <div role="alert" className="alert alert-error alert-soft mb-3">
                    <span>{error}</span>
                  </div>
                )}

                {error === "❌ Mobile not registered" ? (
                  <button
                    type="button"
                    onClick={() => router.push("/studentsgala/register")}
                    style={{ backgroundColor: Colors.primary }}
                    className="w-full text-white py-3 rounded-lg font-semibold hover:brightness-95"
                  >
                    Register Now
                  </button>
                ) : (
                  <button
                    type="submit"
                    style={{ backgroundColor: Colors.accent }}
                    className="w-full text-white py-3 rounded-lg font-semibold hover:brightness-95"
                    disabled={loading}
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>
                )}
              </form>
            )}

            {foundUser && (
              <div className="flex flex-col items-center mt-4">
                {/* SPINNER LOADING */}
                {imageLoading && (
                  <div className="text-center py-6">
                    <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm mt-2 text-gray-600">Generating preview...</p>
                  </div>
                )}

                {/* SHOW CARD AFTER TIMEOUT */}
                {showCard && (
                  <WhatsAppCard
                    name={foundUser.name}
                    mobile={foundUser.mobile}
                    ticket={foundUser.ticket}
                    handleImage={() => {}}
                  />
                )}
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
