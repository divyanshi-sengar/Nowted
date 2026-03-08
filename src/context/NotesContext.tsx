/* eslint-disable react-refresh/only-export-components */
import { createContext, useState} from "react";
import type { ReactNode, FC } from "react";

interface NotesContextType {
  refresh: boolean;
  toggleRefresh: () => void;
}

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