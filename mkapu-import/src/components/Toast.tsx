"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

let showToastFn: ((message: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = "success") {
  showToastFn?.(message, type);
}

export default function Toast() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");

  useEffect(() => {
    showToastFn = (msg, t) => {
      setMessage(msg);
      setType(t);
      setOpen(true);
    };
    return () => {
      showToastFn = null;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 3500);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  const isSuccess = type === "success";

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: isSuccess ? "#16a34a" : "#dc2626",
          color: "#fff",
          padding: "12px 18px 12px 14px",
          borderRadius: "10px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          fontSize: "0.9rem",
          fontWeight: 600,
          animation: "toastIn 0.3s ease",
          maxWidth: 380,
        }}
      >
        {isSuccess ? <CheckCircle size={20} /> : <XCircle size={20} />}
        <span>{message}</span>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            marginLeft: 4,
          }}
        >
          <X size={16} />
        </button>
      </div>    </>
  );
}
