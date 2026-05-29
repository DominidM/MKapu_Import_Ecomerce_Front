"use client";
import { AlertTriangle } from "lucide-react";
import { useEffect, useCallback } from "react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "confirm" | "alert";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "confirm",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 99998,
          animation: "fadeIn 0.2s ease",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 99999,
          background: "#fff",
          borderRadius: "14px",
          padding: "1.75rem 1.5rem 1.25rem",
          width: "90%",
          maxWidth: 400,
          boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
          animation: "modalIn 0.2s ease",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
          }}
        >
          <AlertTriangle size={22} color="#f59e0b" strokeWidth={2} />
        </div>

        <h3
          style={{
            margin: "0 0 0.5rem",
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "#1a1a1a",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: "0 0 1.5rem",
            fontSize: "0.875rem",
            color: "#666",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {variant === "confirm" && (
            <button
              onClick={onCancel}
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "8px",
                border: "1px solid #e2e2e2",
                background: "#fafafa",
                color: "#555",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                flex: 1,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f0f0f0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#fafafa")
              }
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              border: "none",
              background: variant === "confirm" ? "#dc2626" : "#f5a623",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              flex: 1,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                variant === "confirm" ? "#b91c1c" : "#d4891a")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                variant === "confirm" ? "#dc2626" : "#f5a623")
            }
          >
            {variant === "confirm" ? confirmLabel : "OK"}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
