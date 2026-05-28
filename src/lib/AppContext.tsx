import React, { createContext, useContext, useState } from "react";

interface AppContextType {
  isOrganizerMode: boolean;
  setOrganizerMode: (value: boolean) => void;
  toggleOrganizerMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isOrganizerMode, setOrganizerMode] = useState(false);

  const toggleOrganizerMode = () => setOrganizerMode((prev) => !prev);

  return (
    <AppContext.Provider value={{ isOrganizerMode, setOrganizerMode, toggleOrganizerMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
