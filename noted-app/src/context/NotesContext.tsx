// src/context/NotesContext.tsx
import React, { createContext, useState } from "react";

interface NotesContextType {
  refresh: boolean;
  toggleRefresh: () => void;
}

export const NotesContext = createContext<NotesContextType>({
  refresh: false,
  toggleRefresh: () => {},
});

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refresh, setRefresh] = useState(false);

  const toggleRefresh = () => setRefresh(prev => !prev);

  return (
    <NotesContext.Provider value={{ refresh, toggleRefresh }}>
      {children}
    </NotesContext.Provider>
  );
};