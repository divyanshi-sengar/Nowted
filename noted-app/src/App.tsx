import Sidebar from "./components/Sidebar";
import Middle from "./components/Middle";
import FullNote from "./components/FullNote";
import { Route, Routes } from "react-router-dom";
import Note from "./components/Note";
import Restore from "./components/Restore";

const App: React.FC = () => {
  return (
    <div className="flex h-screen w-full">

      {/* Sidebar always visible */}
      <div className="w-[20%]">
        <Sidebar />
      </div>
      

      {/* Routes Section */}
      <div className="flex flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="w-[25%] h-full overflow-auto bg-[#1c1c1c]" />
                <div className="flex-1 h-full overflow-auto flex items-center justify-center text-white">
                  <Note />
                </div>
              </>
            }
          />

          {/* Folder Route */}
          <Route
            path="/folders/:folderId"
            element={
              <>
                <div className="w-[25%] h-full overflow-auto">
                  <Middle />
                </div>

                <div className="flex-1 h-full overflow-auto">
                  <Note />
                </div>
              </>
            } />

          {/* Folder and note route */}
          <Route
            path="/folders/:folderId/notes/:noteId"
            element={
              <>
                <div className="w-[25%] h-full overflow-auto">
                  <Middle />
                </div>

                <div className="flex-1 h-full overflow-auto">
                  <FullNote />
                </div>
              </>
            } />

        </Routes>

      </div>
    </div>
  );
};

export default App;