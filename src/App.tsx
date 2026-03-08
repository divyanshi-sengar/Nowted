import { Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Middle from "./components/Middle";
import FullNote from "./components/FullNote";
import Note from "./components/Note";
import React, { useState } from "react";
import Restore from "./components/Restore";
import { ThemeProvider } from "./context/ThemeContext";

import { NotesProvider } from "./context/NotesContext";

const App: React.FC = () => {

  const [refreshKey, setRefreshKey] = useState<number>(0);


  return (
    <ThemeProvider>
      <NotesProvider>
        <div className="flex h-screen w-full bg-main text-main">

          {/* Sidebar */}
          <div className="w-[21%] shrink-0">
            <Sidebar />
          </div>

          {/* Middle */}
          <div className="w-[25%] shrink-0 h-screen flex flex-col">
            <Routes>
              <Route
                path="/"
                element={
                  <div className="p-5 text-muted bg-panel h-full flex items-center justify-center">
                    Select a folder
                  </div>
                }
              />
              <Route path="/folders/:folderId/*" element={<Middle refreshKey={refreshKey} />} />
              <Route path="/archived/*" element={<Middle refreshKey={refreshKey} />} />
              <Route path="/favorites/*" element={<Middle refreshKey={refreshKey} />} />
              <Route path="/trash/*" element={<Middle refreshKey={refreshKey} />} />
              <Route path="/folders/:folderId/restore/*" element={<Middle refreshKey={refreshKey} />} />
            </Routes>
          </div>


          {/* Right Side - Remaining 54% */}
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Note />} />
              <Route path="/folders/:folderId" element={<Note />} />

              <Route path="/folders/:folderId/notes/:noteId" element={<FullNote setRefreshKey={setRefreshKey} />} />

              {/* <Route path="/folders/:folderId/notes/:noteId/restore" element={<Restore />} /> */}

              <Route path="/archived" element={<Note />} />
              <Route path="/archived/notes/:noteId" element={<FullNote setRefreshKey={setRefreshKey} />} />

              <Route path="/favorites" element={<Note />} />
              <Route path="/favorites/notes/:noteId" element={<FullNote setRefreshKey={setRefreshKey} />} />

              <Route path="/trash" element={<Note />} />
              <Route path="/trash/notes/:noteId" element={<Restore />} />

              <Route path="/folders/:folderId/restore/:noteId" element={<Restore />} />

            </Routes>
          </div>
        </div>
      </NotesProvider>
    </ThemeProvider>
  );
};

export default App;