"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
};

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  label,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div
      style={{
        padding: "12px 16px",
        borderTop: "1px solid #e8e8e8",
        background: "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.75rem",
        fontSize: "0.8rem",
        color: "#888",
      }}
    >
      <span>
        {label || "Mostrando"}{" "}
        {totalItems === 0
          ? "0"
          : `${startIndex + 1}–${Math.min(startIndex + pageSize, totalItems)}`}{" "}
        de {totalItems}
      </span>

      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            padding: "6px 10px",
            border: "1px solid #e0e0e0",
            borderRadius: "6px",
            background: "#fff",
            color: "#666",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            opacity: currentPage === 1 ? 0.4 : 1,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) e.currentTarget.style.background = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) e.currentTarget.style.background = "#fff";
          }}
        >
          ← Anterior
        </button>

        <div style={{ display: "flex", gap: "4px" }}>
          {(() => {
            const pages: number[] = [];
            const maxVisible = 7;

            if (totalPages <= maxVisible) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else if (currentPage <= 4) {
              for (let i = 1; i <= maxVisible; i++) pages.push(i);
            } else if (currentPage >= totalPages - 3) {
              for (let i = totalPages - maxVisible + 1; i <= totalPages; i++)
                pages.push(i);
            } else {
              for (let i = currentPage - 3; i <= currentPage + 3; i++)
                pages.push(i);
            }

            return pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                style={{
                  padding: "6px 10px",
                  border:
                    currentPage === page
                      ? "2px solid #f5a623"
                      : "1px solid #e0e0e0",
                  borderRadius: "6px",
                  background: currentPage === page ? "#fff8e6" : "#fff",
                  color: currentPage === page ? "#f5a623" : "#666",
                  fontSize: "0.8rem",
                  fontWeight: currentPage === page ? 700 : 600,
                  cursor: "pointer",
                  minWidth: 32,
                  textAlign: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== page)
                    e.currentTarget.style.background = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== page)
                    e.currentTarget.style.background = "#fff";
                }}
              >
                {page}
              </button>
            ));
          })()}
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: "6px 10px",
            border: "1px solid #e0e0e0",
            borderRadius: "6px",
            background: "#fff",
            color: "#666",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            opacity: currentPage === totalPages ? 0.4 : 1,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages)
              e.currentTarget.style.background = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages)
              e.currentTarget.style.background = "#fff";
          }}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
