import React, { useState, useEffect, useContext } from "react";
import restore from '../images/restore.svg'
import { useParams, useNavigate } from "react-router-dom";
import { NotesContext } from "../context/NotesContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../index.css"

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
  const { noteId } = useParams<{ folderId: string; noteId: string }>();

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
        toast.error("Failed to load note");
      } finally {
        setLoading(false);
      }
    }

    getNote();
  }, [noteId]);

  const handleRestore = async () => {
    if (!note) return;

    try {
      const response = await fetch(
        `https://nowted-server.remotestate.com/notes/${noteId}/restore`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deletedAt: null }),
        }
      );

      if (!response.ok) throw new Error();

      toggleRefresh();

      // ✅ Show toast first
      toast.success(`"${note.title}" restored successfully`, {
        autoClose: 2000,
        onClose: () => navigate(`/folders/${note.folder.id}`)
      });

    } catch (err) {
      console.error("Restore failed", err);
      toast.error("Restore failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-main text-main">
        <p className="text-muted">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen h-full bg-main text-main">
      <div className="flex flex-col items-center justify-center p-5 w-[500px] text-center rounded-lg shadow-lg">
        
        <img src={restore} alt="" className="icon-theme"/>

        <h2 className="text-main text-xl font-semibold mt-4">
          Restore "{note?.title || "Loading..."}"
        </h2>

        <p className="text-muted mt-2">
          Don't want to lose this note? It's not too late! Just click the
          'Restore' button and it will be added back to your list. It's that simple.
        </p>

        <button
          onClick={handleRestore}
          className="mt-6 px-6 py-2 bg-menu hover:bg-primary text-main font-medium rounded-md transition duration-200"
        >
          Restore
        </button>
      </div>

      
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default Restore;