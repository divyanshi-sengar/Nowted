import React from "react";
import restore from '../images/restore.svg'
import { useState, useEffect,useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NotesContext } from "../context/NotesContext";


interface Note {
  id: string;
  title: string;
  folder: {
    id: string;
    name: string;
  };
}

const Restore: React.FC = () => {
  const navigate = useNavigate();

  const { folderId, noteId } = useParams<{ folderId: string; noteId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toggleRefresh } = useContext(NotesContext);

  useEffect(() => {
    if (!noteId) return;

    async function getNote() {
      try {
        const response = await fetch(
          `https://nowted-server.remotestate.com/notes/${noteId}`
        );
        const data = await response.json();
        setNote(data.note);

      } catch (err) {
        console.log("Error fetching note", err);
      }finally {
        setLoading(false);
      }
    }

    getNote();
  }, [noteId]);

   const handleRestore = async () => {
    if ( !note) return;

    try {
      await fetch(`https://nowted-server.remotestate.com/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived:false , isFavorite:false}),
      });

      // Trigger middle pane refresh
      toggleRefresh();

      // Navigate back to the folder and highlight restored note

        navigate(`/folders/${note.folder.id}`); 
      // navigate(`/folders/${note.folder.id}/notes/${note.id}`);
    } catch (err) {
      console.error("Restore failed", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen h-full bg-[#121212] ">
      <div className="flex flex-col items-center justify-center p-5 w-[500px] text-center">
        <img
          src={restore}
          alt=""
        />

        <h2 className="text-white text-xl font-semibold mt-4">
          Restore "{note?.title || "Loading..."}"
        </h2>

        <p className="text-gray-400 mt-2">
          Don't want to lose this note? It's not too late! Just click the 'Restore' button and it will be added back to your list. It's that simple.
        </p>

        <button
          onClick={handleRestore}
          className="mt-6 px-6 py-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-medium rounded-md transition duration-200">
          Restore
        </button>
      </div>
    </div>
  );
};

export default Restore;