import React from "react";
import largedoc from '../images/largedoc_icon.svg'

const Note: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen h-full overflow-y-auto bg-[#121212] text-gray-300 font-['Source_Sans_Pro']">
      <div className="flex flex-col items-center justify-center p-5 w-[500px] text-center">
        <img
          src={largedoc}
          alt=""
        />

        <h2 className="text-white text-xl font-semibold mt-4">
          Select a note to view 
        </h2>

        <p className="text-gray-400 mt-2">
          Choose a note from the list on the left to view its content, or create a new note to add to your collection.
        </p>
      </div>
    </div>
  );
};

export default Note;