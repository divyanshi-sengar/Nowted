import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { NotesContext } from "../context/NotesContext"; // your NotesContext
import React from "react";

import Loader from "../components/Loader";

import "./Sidebar.css";

interface MiddleProps { refreshKey: number }

interface Folder { id: string; name: string }

interface Note {
  id: string;
  title: string;
  preview: string;
  folderId: string;
  folder: Folder;
  isArchived: boolean;
  isFavorite: boolean;
  deletedAt?: string | null;
  createdAt: string;

  updatedAt?: string;
}

const Middle: React.FC<MiddleProps> = ({ refreshKey }) => {
  const { folderId: routeFolderId, noteId } = useParams<{ folderId?: string; noteId?: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folderName, setFolderName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { refresh } = useContext(NotesContext);

  const navigate = useNavigate();
  const location = useLocation();
  const [selectedNote, setSelectedNote] = useState<string | null>(noteId || null);


  const isArchivedView = location.pathname.startsWith("/archived");
  const isFavoriteView = location.pathname.startsWith("/favorites");
  const isTrashView = location.pathname.startsWith("/trash");

  const viewMode =
    location.pathname.startsWith("/archived") ? "archived" :
      location.pathname.startsWith("/favorites") ? "favorites" :
        location.pathname.startsWith("/trash") ? "trash" :
          "folder";

  useEffect(() => {
  let isActive = true;

  const fetchNotes = async () => {
    try {
      setLoading(true);

      let folderId = routeFolderId;

      // If opened directly via note URL, fetch its folder
      if (!folderId && noteId) {
        const noteRes = await fetch(`https://nowted-server.remotestate.com/notes/${noteId}`);
        const noteData = await noteRes.json();
        folderId = noteData.note.folder.id;
      }

      const base = "https://nowted-server.remotestate.com/notes";
      let fetchedNotes: Note[] = [];


      // view archived

      if (viewMode === "archived") {
        const res = await fetch(`${base}?archived=true&deleted=false&limit=10`);
        const data = await res.json();
        if (!isActive) return;
        fetchedNotes = data.notes ?? [];
      }


      // VIEW: FAVORITES (archived true + false)

      else if (viewMode === "favorites") {
        const favBase = `${base}?favorite=true&deleted=false&limit=10`;

        const [archTrueRes, archFalseRes] = await Promise.all([
          fetch(`${favBase}&archived=true`),
          fetch(`${favBase}&archived=false`)
        ]);

        const [archTrueData, archFalseData] = await Promise.all([
          archTrueRes.json(),
          archFalseRes.json()
        ]);

        if (!isActive) return;

        const notesTrue: Note[] = archTrueData.notes ?? [];
        const notesFalse: Note[] = archFalseData.notes ?? [];

        // Merge + remove duplicates
        fetchedNotes = Array.from(
          new Map([...notesTrue, ...notesFalse].map(n => [n.id, n])).values()
        );

        // Sort by latest time
        fetchedNotes.sort((a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
        );
      }


      // VIEW: TRASH

      else if (viewMode === "trash") {
        const res = await fetch(`${base}?deleted=true&limit=30`);
        const data = await res.json();
        if (!isActive) return;
        fetchedNotes = data.notes ?? [];
      }


      // VIEW: FOLDER

      else if (folderId) {
        const res = await fetch(`${base}?folderId=${folderId}&limit=10`);
        const data = await res.json();
        if (!isActive) return;
        fetchedNotes = data.notes ?? [];
      }

      
      // NO VIEW
   
      else {
        if (isActive) {
          setNotes([]);
          setLoading(false);
        }
        return;
      }

 
      // FINAL FILTERING
  
      const filteredNotes =
        viewMode === "archived"
          ? fetchedNotes.filter(n => n.isArchived && !n.deletedAt)
          : viewMode === "favorites"
            ? fetchedNotes.filter(n => n.isFavorite && !n.deletedAt)
            : viewMode === "trash"
              ? fetchedNotes.filter(n => n.deletedAt != null)
              : folderId
                ? fetchedNotes.filter(n => n.folderId === folderId && !n.isArchived && !n.deletedAt)
                : [];

      setNotes(filteredNotes);

      // Folder Name (Folder View)
    
      if (viewMode === "folder" && folderId) {
        if (filteredNotes.length > 0) {
          setFolderName(filteredNotes[0].folder.name);
        } else {
          const folderRes = await fetch(`https://nowted-server.remotestate.com/folders`);
          const folderData = await folderRes.json();
          const currentFolder = folderData.folders.find((f: Folder) => f.id === folderId);
          setFolderName(currentFolder?.name || "");
        }
      }

    } catch (error) {
      console.error("Error fetching notes:", error);
      if (isActive) setNotes([]);
    } finally {
      if (isActive) setLoading(false);
    }
  };

  fetchNotes();

  return () => {
    isActive = false;
  };
}, [routeFolderId, noteId, refreshKey, viewMode, refresh]);

  useEffect(() => {
    setSelectedNote(noteId || null);
  }, [noteId]);

  const pageTitle = isArchivedView
    ? "Archived Notes"
    : isFavoriteView
      ? "Favorite Notes"
      : isTrashView
        ? "Trash"
        : folderName || "Folder Notes";

  return (
    <div className="p-5 h-full bg-panel text-main flex flex-col gap-5">
      <div className="text-[22px] font-semibold text-main shrink-0 break-words whitespace-normal">{pageTitle}</div>
      {loading ? (
        // Show loader while loading
        <Loader />
      ) : notes.length === 0 ? (
        <div className="text-muted flex-1 flex items-center justify-center">No Notes</div>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-4">
          {notes.map(note => {
            return (
              <div
                key={note.id}
                onClick={() => {
                  setSelectedNote(note.id)
                  if (isArchivedView) navigate(`/archived/notes/${note.id}`);
                  else if (isFavoriteView) navigate(`/favorites/notes/${note.id}`);
                  else if (isTrashView) navigate(`/trash/notes/${note.id}`);
                  else navigate(`/folders/${note.folderId}/notes/${note.id}`);
                }}
                className={`rounded p-5 cursor-pointer transition-all duration-200
  ${selectedNote === note.id
                    ? "shadow-[0_0_15px_3px_rgba(59,130,246,0.5)] border-l-4 border-blue-500"
                    : "bg-card hover:bg-hover border-l-4 border-transparent"
                  } ${notes[0].id === note.id ? "mt-1" : ""}`}
              >
                <div className="text-[18px] font-semibold text-main break-words whitespace-normal overflow-hidden">
                  {note.title || "Untitled"}
                </div>
                <div className="flex gap-[10px] text-muted text-sm">
                  <p>{new Date(note.createdAt).toLocaleDateString()}</p>
                  <span className="truncate">{note.preview}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(Middle, (prevProps, nextProps) => {
  // Only re-render if refreshKey changes
  return prevProps.refreshKey === nextProps.refreshKey;
});