import React from "react";

export default function WhatsAppButton() {
  // Replace with your WhatsApp number, including country code 91
  const phoneNumber = "919607799171";

  const message =
    "Hello Bhabireev E-Mobility! I am interested in your electric vehicles. Please share the price and details.";

  const openWhatsApp = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={openWhatsApp}
      aria-label="Chat on WhatsApp"
      style={{
        position: "fixed",
        bottom: "25px",
        right: "25px",
        zIndex: 99999,
        background: "#25D366",
        color: "#fff",
        border: "none",
        borderRadius: "50px",
        padding: "15px 22px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 4px 15px rgba(0,0,0,0.25)"
      }}
    >
      ☎ Chat on WhatsApp
    </button>
  );
}