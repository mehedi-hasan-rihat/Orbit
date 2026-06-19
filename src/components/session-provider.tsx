"use client";

import { createContext, useContext } from "react";

interface SessionContext {
  userId: string;
  name: string;
  email: string;
}

const SessionCtx = createContext<SessionContext | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionContext;
  children: React.ReactNode;
}) {
  return <SessionCtx.Provider value={user}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
