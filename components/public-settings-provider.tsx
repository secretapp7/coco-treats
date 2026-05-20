"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { PublicBusinessSettings } from "@/lib/settings/public-settings-types";

const PublicSettingsContext = createContext<PublicBusinessSettings | null>(null);

export function PublicSettingsProvider({
  settings,
  children,
}: {
  settings: PublicBusinessSettings;
  children: ReactNode;
}) {
  return (
    <PublicSettingsContext.Provider value={settings}>{children}</PublicSettingsContext.Provider>
  );
}

export function usePublicBusinessSettings(): PublicBusinessSettings {
  const ctx = useContext(PublicSettingsContext);
  if (!ctx) {
    throw new Error("usePublicBusinessSettings must be used within PublicSettingsProvider");
  }
  return ctx;
}
