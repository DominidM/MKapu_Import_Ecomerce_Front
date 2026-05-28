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

const EmpresaContext = createContext<EmpresaContextType | null>(null);

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/empresa")
      .then((r) => r.json())
      .then((d) => { if (d) setEmpresa(d); })
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
