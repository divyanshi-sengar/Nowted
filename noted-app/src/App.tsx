import Sidebar from "./components/Sidebar";
import Middle from "./components/Middle";
import Note from "./components/Note";

const App: React.FC = () => {
  return (
    <div className="flex h-screen w-full">
      
      {/* Sidebar → 20% */}
      <div className="w-[20%]">
        <Sidebar />
      </div>

      {/* Middle → 25%, scrollable */}
      <div className="w-[25%] h-full overflow-auto">
        <Middle />
      </div>

      {/* Note → Remaining width */}
      <div className="flex-1 h-full overflow-auto">
        <Note />
      </div>

    </div>
  );
};

export default App;