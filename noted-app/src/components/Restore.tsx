import React from "react";
import restore from '../images/restore.svg'
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Restore: React.FC = () => {

    const { noteId } = useParams<{ noteId: string }>();

    interface Note {
  id: string;
  title: string;
}

const [note, setNote] = useState<Note | null>(null);

useEffect(() => {
  if (!noteId) return;

  async function getNote() {
    try {
      const response = await fetch(
        `https://nowted-server.remotestate.com/notes/${noteId}`
      );
      const data = await response.json();
      setNote(data); // NOT data.note (check your API)
    } catch (err) {
      console.log("Error fetching note", err);
    }
  }

  getNote();
}, [noteId]);

    return (
        <div className="flex items-center justify-center min-h-screen ">
            <div className="flex flex-col items-center justify-center p-5 w-[500px] text-center">
                <img
                    src={restore}
                    alt=""
                />

                <h2 className="text-white text-xl font-semibold mt-4">
                    {note?.title || "Loading..."}
                </h2>

                <p className="text-gray-400 mt-2">
                    Don't want to lose this note? It's not too late! Just click the 'Restore' button and it will be added back to your list. It's that simple.
                </p>

                <button className="mt-6 px-6 py-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-medium rounded-md transition duration-200">
                    Restore
                </button>
            </div>
        </div>
    );
};

export default Restore;