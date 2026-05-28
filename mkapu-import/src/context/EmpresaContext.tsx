"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type EmpresaData = {
  id: number;
  nombre: string;
  razon_social: string | null;
  ruc: string | null;
  direccion: string | null;
  logo: string | null;
  email: string | null;
  whatsapp: string | null;
  whatsapp_soporte: string | null;
  numero_reclamos: string | null;
  descripcion: string | null;
  horario_atencion: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
};

interface EmpresaContextType {
  empresa: EmpresaData | null;
  loaded: boolean;
}

const STORAGE_KEY = "mkapu_empresa";

function getCached(): EmpresaData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCached(data: EmpresaData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

const EmpresaContext = createContext<EmpresaContextType | null>(null);

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const cached = getCached();
  const [empresa, setEmpresa] = useState<EmpresaData | null>(cached);
  const [loaded, setLoaded] = useState(!!cached);

  useEffect(() => {
    fetch("/api/empresa")
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setEmpresa(d);
          setCached(d);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  return (
    <EmpresaContext.Provider value={{ empresa, loaded }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext);
  if (!ctx) throw new Error("useEmpresa must be inside EmpresaProvider");
  return ctx;
}
