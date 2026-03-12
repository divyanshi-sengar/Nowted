import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { NotesContext } from "../context/NotesContext";
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

interface GetNoteResponse {
  note: Note;
}

interface GetNotesResponse {
  notes: Note[] | null;
}

interface GetFoldersResponse {
  folders: Folder[];
}
const LIMIT = 10;

const Middle: React.FC<MiddleProps> = ({ refreshKey }) => {
  const { folderId: routeFolderId, noteId } = useParams<{ folderId?: string; noteId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useContext(NotesContext);

  const [notes, setNotes] = useState<Note[]>([]);
  const [folderName, setFolderName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [visibleCount, setVisibleCount] = useState(LIMIT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [selectedNote, setSelectedNote] = useState<string | null>(noteId || null);

  const isArchivedView = location.pathname.startsWith("/archived");
  const isFavoriteView = location.pathname.startsWith("/favorites");
  const isTrashView = location.pathname.startsWith("/trash");

  let viewMode;

  if (isArchivedView) {
    viewMode = "archived";
  }
  else if (isFavoriteView) {
    viewMode = "favorites";
  }
  else if (isTrashView) {
    viewMode = "trash";
  }
  else {
    viewMode = "folder";
  }
  // fetch notes
  useEffect(() => {
    let isActive = true;

    const fetchNotes = async () => {
      try {
        setLoading(true);
        let folderId = routeFolderId;

        if (!folderId && noteId) {
          const noteRes = await fetch(`https://nowted-server.remotestate.com/notes/${noteId}`);
          const noteData:GetNoteResponse = await noteRes.json();
          folderId = noteData.note.folder.id;
        }

        const base = "https://nowted-server.remotestate.com/notes";
        let fetchedNotes: Note[] = [];

        if (viewMode === "archived") {
          const res = await fetch(`${base}?archived=true&deleted=false&limit=all`);
          const data:GetNotesResponse = await res.json();
          if (!isActive) return;
          if (data.notes !== null && data.notes !== undefined) {
            fetchedNotes = data.notes;
          } else {
            fetchedNotes = [];
          }
        }

        else if (viewMode === "favorites") {
          const favBase = `${base}?favorite=true&deleted=false&limit=all`;
          const [a, b] = await Promise.all([
            fetch(`${favBase}&archived=true`),
            fetch(`${favBase}&archived=false`)
          ]);
          const [ad, bd]:[GetNotesResponse,GetNotesResponse] = await Promise.all([a.json(), b.json()]);
          if (!isActive) return;

          const merged = [...(ad.notes ?? []), ...(bd.notes ?? [])];
          fetchedNotes = Array.from(new Map(merged.map(n => [n.id, n])).values());

          fetchedNotes.sort((x, y) =>
            new Date(y.updatedAt || y.createdAt).getTime() -
            new Date(x.updatedAt || x.createdAt).getTime()
          );
        }

        else if (viewMode === "trash") {
          const res = await fetch(`${base}?deleted=true&limit=all`);
          const data:GetNotesResponse = await res.json();
          if (!isActive) return;
          fetchedNotes = data.notes ?? [];
        }

        else if (folderId) {
          const res = await fetch(`${base}?folderId=${folderId}&limit=all`);
          const data = await res.json();
          if (!isActive) return;
          if (data.notes === null || data.notes === undefined) {
            fetchedNotes = [];
          } else {
            fetchedNotes = data.notes;
          }
        }

        else {
          setNotes([]);
          return;
        }

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

        if (viewMode === "folder" && folderId) {
          if (filteredNotes.length > 0) {
            setFolderName(filteredNotes[0].folder.name);
          } else {
            const folderRes = await fetch(`https://nowted-server.remotestate.com/folders`);
            const folderData :GetFoldersResponse= await folderRes.json();
            const current = folderData.folders.find((f: Folder) => f.id === folderId);
            setFolderName(current?.name || "");
          }
        }

      } catch (e) {
        console.error(e);
        setNotes([]);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchNotes();
    return () => { isActive = false; };
  }, [routeFolderId, noteId, refreshKey, viewMode, refresh]);

  // reset visible items when new notes load
  useEffect(() => {
    setVisibleCount(LIMIT);
  }, [notes]);

  // intersection observer
  const lastNoteRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || isLoadingMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < notes.length) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount(prev => prev + LIMIT);
          setIsLoadingMore(false);
        }, 800);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, isLoadingMore, visibleCount, notes.length]);

  useEffect(() => {
    setSelectedNote(noteId || null);
  }, [noteId]);

  const pageTitle =
    isArchivedView ? "Archived Notes" :
      isFavoriteView ? "Favorite Notes" :
        isTrashView ? "Trash" :
          folderName || "Folder Notes";


  return (
    <div className="p-5 h-screen bg-panel text-main flex flex-col gap-5">
      <div className="text-[22px] font-semibold shrink-0 ">{pageTitle}</div>

      {loading ? (
        <Loader />
      ) : notes.length === 0 ? (
        <div className="text-muted flex-1 flex items-center justify-center">No Notes</div>
      ) : (
        <div className="flex-1 overflow-y-auto  overflow-x-visible flex flex-col gap-5 pr-4 pt-4 custom-scroll">
          {notes.slice(0, visibleCount).map((note, index, arr) => {
            const isLast = index === arr.length - 1;

            return (
              <div
                key={note.id}
                ref={isLast ? lastNoteRef : null}
                onClick={() => {
                  setSelectedNote(note.id);
                  if (isArchivedView) navigate(`/archived/notes/${note.id}`);
                  else if (isFavoriteView) navigate(`/favorites/notes/${note.id}`);
                  else if (isTrashView) navigate(`/trash/notes/${note.id}`);
                  else navigate(`/folders/${note.folderId}/notes/${note.id}`);
                }}
                className={`rounded p-5 cursor-pointer transition-all duration-200
                  ${selectedNote === note.id
                    ? "shadow-[0_0_15px_3px_rgba(59,130,246,0.5)] border-l-4 border-blue-500"
                    : "bg-card hover:bg-hover border-l-4 border-transparent"
                  }`}
              >
                <div className="text-[18px] font-semibold break-words whitespace-normal overflow-hidden">
                  {note.title || "Untitled"}
                </div>
                <div className="flex gap-[10px] text-muted text-sm">
                  <p>{new Date(note.createdAt).toLocaleDateString()}</p>
                  <span className="truncate">{note.preview}</span>
                </div>
              </div>
            );
          })}

          {isLoadingMore && (
            <div className="py-4 text-center text-muted">Loading...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(Middle, (prev, next) => prev.refreshKey === next.refreshKey);