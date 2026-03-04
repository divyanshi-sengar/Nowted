import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

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
}

const Middle: React.FC<MiddleProps> = ({ refreshKey }) => {
  const { folderId } = useParams<{ folderId: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folderName, setFolderName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const selectedNoteId = location.pathname.split("/").pop();

  const isArchivedView = location.pathname.startsWith("/archived");
  const isFavoriteView = location.pathname.startsWith("/favorites");
  const isTrashView = location.pathname.startsWith("/trash");

useEffect(() => {
  const fetchNotes = async () => {
    try {
      setLoading(true);

      let url = "";

      if (isArchivedView) {
        url = "https://nowted-server.remotestate.com/notes?isArchived=true&limit=1000";
      } else if (isFavoriteView) {
        url = "https://nowted-server.remotestate.com/notes?isFavorite=true&limit=1000";
      } else if (folderId) {
        url = `https://nowted-server.remotestate.com/notes?folderId=${folderId}&limit=1000`;
      } else if (isTrashView) {
        url = "https://nowted-server.remotestate.com/notes?deleted=true&limit=1000";
      } else {
        setNotes([]);
        setLoading(false);
        return;
      }

      const res = await fetch(url);
      const data = await res.json();
      const fetchedNotes: Note[] = Array.isArray(data.notes) ? data.notes : [];

      let filteredNotes = fetchedNotes;

      // Filter logic by view
      if (folderId) {
        filteredNotes = fetchedNotes.filter(n => !n.isArchived && !n.deletedAt);
      }
      if (isArchivedView) {
        filteredNotes = fetchedNotes.filter(n => n.isArchived && !n.deletedAt);
      }
      if (isFavoriteView) {
        filteredNotes = fetchedNotes.filter(n => n.isFavorite && !n.deletedAt);
      }
      if (isTrashView) {
        filteredNotes = fetchedNotes.filter(n => n.deletedAt); // only deleted notes
      }

      setNotes(filteredNotes);

      // Set folder name for folder view
      if (folderId && filteredNotes.length > 0) {
        setFolderName(filteredNotes[0].folder.name);
      } else {
        setFolderName(""); // reset if not in folder
      }

    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  fetchNotes();
}, [folderId, location.pathname, refreshKey]);

  const pageTitle = isArchivedView
    ? "Archived Notes"
    : isFavoriteView
      ? "Favorite Notes"
      : isTrashView
        ? "Trash"
        : folderName || "Folder Notes";

  return (
    <div className="p-5 h-full bg-[#1c1c1c] flex flex-col gap-5">
      <div className="text-[22px] font-semibold text-white shrink-0">{pageTitle}</div>

      {/* {loading && <p className="text-gray-400 text-sm"></p>} */}

      {!loading && notes.length === 0 ? (
        <div className="text-gray-400 flex-1 flex items-center justify-center">No Notes</div>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-4">
          {notes.map(note => {
            const isSelected = selectedNoteId === note.id;
            return (
              <div
                key={note.id}
                onClick={() => {
                  if (isArchivedView) navigate(`/archived/notes/${note.id}`);
                  else if (isFavoriteView) navigate(`/favorites/notes/${note.id}`);
                  else if (isTrashView) navigate(`/trash/notes/${note.id}`);
                  else navigate(`/folders/${folderId}/notes/${note.id}`);
                }}
                className={`bg-[#232323] rounded-[2px] p-5 flex flex-col gap-[15px] cursor-pointer hover:bg-[#2a2a2a] transition-colors ${isSelected ? "border-l-4 border-blue-500" : ""}`}
              >
                <div className="text-[18px] font-semibold text-white break-words whitespace-normal overflow-hidden">{note.title || "Untitled"}</div>
                <div className="flex gap-[10px] text-gray-400 text-sm">
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

export default Middle;