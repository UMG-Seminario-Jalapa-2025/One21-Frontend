"use client";

import { createContext, useContext, useState } from "react";

import { Backdrop, CircularProgress, Typography } from "@mui/material";


type LoadingContextType = {
  esperar: () => void;
  finEspera: () => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export const useLoading = () => {
  const ctx = useContext(LoadingContext);

  if (!ctx) throw new Error("useLoading must be used inside LoadingProvider");

  return ctx;
};

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const esperar = () => setOpen(true);
  const finEspera = () => setOpen(false);

  return (
    <LoadingContext.Provider value={{ esperar, finEspera }}>
      {children}

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
        open={open}
      >
        <div style={{ textAlign: "center" }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" mt={2}>
            Esperar por favor...
          </Typography>
        </div>
      </Backdrop>
    </LoadingContext.Provider>
  );
}
