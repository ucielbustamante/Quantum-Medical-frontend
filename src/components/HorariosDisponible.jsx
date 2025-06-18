import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function HorariosDisponibles({ disponibilidad }) {
  const [abierto, setAbierto] = useState(false);
  const btnRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (abierto && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
  }, [abierto]);

  return (
    <div className="mt-2">
      <button
        className="btn btn-sm btn-outline-secondary w-100"
        onClick={() => setAbierto(!abierto)}
        ref={btnRef}
      >
        {abierto ? "Ocultar horarios disponibles" : "Ver horarios disponibles"}
      </button>

      {abierto &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              zIndex: 9999,
              minWidth: "250px",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              fontSize: "0.875rem",
            }}
          >
            {disponibilidad.length === 0 && (
              <div className="text-muted">Sin horarios disponibles</div>
            )}
            {disponibilidad.map((d, i) => (
              <div key={i}>
                {diasSemana[d.weekday]}: {d.start_time} - {d.end_time} ({d.slot_duration_min} min)
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
