// src/context/NotesContext.tsx
import React, { createContext, useState, ReactNode, FC } from "react";

// Define the shape of the context
interface NotesContextType {
  refresh: boolean;
  toggleRefresh: () => void;
}

// Create context with default values
export const NotesContext = createContext<NotesContextType>({
  refresh: false,
  toggleRefresh: () => {},
});

// Provider component
interface NotesProviderProps {
  children: ReactNode;
}

export const NotesProvider: FC<NotesProviderProps> = ({ children }) => {
  const [refresh, setRefresh] = useState<boolean>(false);

  const toggleRefresh = () => setRefresh(prev => !prev);

  return (
    <NotesContext.Provider value={{ refresh, toggleRefresh }}>
      {children}
    </NotesContext.Provider>
  );
};