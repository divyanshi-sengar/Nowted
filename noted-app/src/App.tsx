import Sidebar from "./components/Sidebar";
import Middle from "./components/Middle";
import FullNote from "./components/FullNote";
import { Route, Routes, useNavigate } from "react-router-dom";
import Note from "./components/Note";
import Restore from "./components/Restore";
import { useState } from "react";
import ArchieveNotes from "./components/archieveNotes";
import { NotesProvider } from "./context/NotesContext";

const App: React.FC = () => {

  // const [middleView, setMiddleView] = useState<"notes" | "archived">("notes");
  const navigate = useNavigate();

  const [refreshKey, setRefreshKey] = useState(0);
  // Optional: Reset selected note when switching to archived
  // const handleMiddleViewChange = (view: "notes" | "archived") => {
  //   setMiddleView(view);
  //   // navigate("/"); // Reset right pane
  // };
  return (
    <NotesProvider>
      <div className="flex h-screen w-full">

        {/* Sidebar - 21% */}
        <div className="w-[21%] shrink-0">
          <Sidebar
          // middleView={middleView}
          // setMiddleView={handleMiddleViewChange}
          />
        </div>

        {/* Middle - 25% */}
        {/* Middle - 25% */}
        <div className="w-[25%] shrink-0 h-screen flex flex-col">
          <Routes className="flex-1">
            <Route
              path="/"
              element={<div className="p-5 text-gray-400 bg-[#1c1c1c] h-full flex items-center justify-center">Select a folder</div>}
            />

            {/* Match folder and all nested paths */}
            <Route path="/folders/:folderId/*" element={<Middle refreshKey={refreshKey} />} />

            {/* Archived folder */}
            <Route path="/archived/*" element={<Middle refreshKey={refreshKey} />} />
          </Routes>
        </div>
        {/* Right Side - Remaining 54% */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Note />} />
            <Route path="/folders/:folderId" element={<Note />} />
            <Route path="/folders/:folderId/notes/:noteId" element={<FullNote setRefreshKey={setRefreshKey} />} />
            <Route path="/archived/notes/:noteId" element={<FullNote setRefreshKey={setRefreshKey} />} />
            <Route path="/archived" element={<Note />} />
          </Routes>
        </div>

      </div>
    </NotesProvider>
  );
};

export default App;