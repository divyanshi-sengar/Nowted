import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

interface MiddleProps {
  refreshKey: number;
}

interface Note {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  folderId: string;
  folder?: {
    id: string;
    name: string;
  };
  isArchived: boolean;
}

const Middle: React.FC<MiddleProps> = ({ refreshKey }) => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [notes, setNotes] = useState<Note[]>([]);
  const [folderName, setFolderName] = useState<string>("Folder"); // default folder name

  const isArchivedView = location.pathname.startsWith("/archived");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(
          "https://nowted-server.remotestate.com/notes?limit=1000"
        );

        if (!response.ok) {
          console.error("Failed to fetch notes", response.status, response.statusText);
          setNotes([]);
          setFolderName(isArchivedView ? "Archived Notes" : "No Notes in Folder");
          return;
        }

        const data :{ notes: Note[] }  = await response.json();
        const allNotes:Note[] = Array.isArray(data.notes) ? data.notes : [];

        let filteredNotes:Note[] = [];

        if (isArchivedView) {
          // Show only archived notes
          filteredNotes = allNotes.filter(note => note.isArchived);
          setFolderName("Archived Notes");
        } else if (folderId) {
          // Show only notes in current folder, excluding archived
          filteredNotes = allNotes.filter(
            note => note.folderId === folderId && !note.isArchived
          );

          // Always get folder name from folder object
          const folderFromNotes = allNotes.find(n => n.folderId === folderId)?.folder;
          setFolderName(folderFromNotes?.name || "No Notes in Folder");
        } else {
          filteredNotes = [];
          setFolderName("No Notes");
        }

        setNotes(filteredNotes);
      } catch (err) {
        console.error("Error fetching notes:", err);
        setNotes([]);
        setFolderName(isArchivedView ? "Archived Notes" : "No Notes in Folder");
      }
    };

    fetchNotes();
  }, [folderId, refreshKey, location.pathname]);

  return (
  <div className="p-5 h-full bg-[#1c1c1c] flex flex-col gap-5">
    {/* Folder Name */}
    <div className="text-[22px] font-semibold text-white shrink-0">{folderName}</div>

    {/* No Notes Message */}
    {notes.length === 0 && (
      <div className="text-gray-400 flex-1 flex items-center justify-center">
        No Notes in this Folder
      </div>
    )}

    {/* Notes List - Scrollable */}
    {notes.length > 0 && (
      <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-4">
        {notes.map(note => (
          <div
            key={note.id}
            onClick={() => {
              if (isArchivedView) {
                navigate(`/archived/notes/${note.id}`);
              } else {
                navigate(`/folders/${folderId}/notes/${note.id}`);
              }
            }}
            className="bg-[#232323] rounded-[2px] p-5 flex flex-col gap-[15px] cursor-pointer hover:bg-[#2a2a2a] transition-colors"
          >
            <div className="text-[18px] font-semibold leading-[28px] text-white">
              {note.title || "Untitled"}
            </div>
            <div className="flex gap-[10px] text-gray-400 text-sm">
              <p>{new Date(note.createdAt).toLocaleDateString()}</p>
              <span className="truncate">{note.preview}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
export default Middle;