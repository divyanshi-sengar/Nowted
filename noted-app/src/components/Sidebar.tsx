import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

import { useDebounce } from "../hooks/useDebounce";
import { searchNotes } from "../services/notesservies";
import { highlightText } from "../utils/highlightText";

import { Search, Plus, Trash2 } from "lucide-react";

import archieved from "../images/archieved.svg";
import newfolder from "../images/create-folder.svg";
import documentIcon1 from "../images/document1.svg";
import favourite from "../images/favourite.svg";
import foldericon from "../images/folder-icon.svg";
import simpfolder from "../images/simp-folder.svg";
import trash from "../images/trash.svg";
import pen from "../images/Vector.svg";

interface Note {
  id: string;
  folderId: string;
  title: string;
}

interface Folder {
  id: string;
  name: string;
  deletedAt?: string | null;
}

interface RecentNote {
  id: string;
  title: string;
  folder: {
    id: string;
    name: string;
  };
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [recents, setRecents] = useState<RecentNote[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const debouncedQuery = useDebounce(searchQuery, 500);
  const searchRef = useRef<HTMLDivElement>(null);

  const getCurrentFolderId = () => {
    const match = location.pathname.match(/\/folders\/([^/]+)/);
    return match ? match[1] : null;
  };

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    fetchFolders();
    fetchRecents();
  }, []);

  const fetchFolders = async () => {
    try {
      const res = await fetch("https://nowted-server.remotestate.com/folders");
      const data = await res.json();
      setFolders(data.folders || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecents = async () => {
    try {
      const res = await fetch("https://nowted-server.remotestate.com/notes/recent");
      const data = await res.json();
      setRecents(data.recentNotes || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- SEARCH ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }
      try {
        setLoading(true);
        const notes = await searchNotes(debouncedQuery);
        setResults(notes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- FOLDER ACTIONS ---------------- */

  const createFolder = async () => {
    if (!folderName.trim()) return;

    await fetch("https://nowted-server.remotestate.com/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: folderName }),
    });

    setFolderName("");
    setShowInput(false);
    fetchFolders();
  };

  const deleteFolder = async (id: string) => {
    await fetch(`https://nowted-server.remotestate.com/folders/${id}`, {
      method: "DELETE",
    });
    fetchFolders();
    navigate("/");
  };

  const renameFolder = async (id: string) => {
    if (!editedName.trim()) return;

    await fetch(`https://nowted-server.remotestate.com/folders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editedName }),
    });

    setEditingFolderId(null);
    fetchFolders();
  };

  /* ---------------- ADD NOTE ---------------- */

  const addNote = async () => {
    const folderId = getCurrentFolderId();
    if (!folderId || !noteTitle.trim()) return;

    const res = await fetch("https://nowted-server.remotestate.com/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folderId,
        title: noteTitle,
        content: noteContent,
        isFavorite: false,
        isArchived: false,
      }),
    });

    const data = await res.json();
    setForm(false);
    setNoteTitle("");
    setNoteContent("");
    navigate(`/folders/${folderId}/notes/${data.id}`);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="h-full bg-[#121212] text-gray-300 flex flex-col">

      {/* HEADER */}
      <div className="px-5 pt-5 mb-6 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-white text-[26px] font-[Kaushan_Script]">
              Nowted
            </h2>
            <img src={pen} className="h-[15px] -mt-3" />
          </div>
          <Search
            size={18}
            className="cursor-pointer"
            onClick={() => {
              setIsSearching((prev) => !prev);
              setSearchQuery("");
              setResults([]);
            }}
          />
        </div>

        {!isSearching ? (
          <button
            onClick={() => setForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] py-2 rounded"
          >
            <Plus size={16} /> Add Note
          </button>
        ) : (
          <div ref={searchRef} className="relative">
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-[#1f1f1f] px-3 py-2 rounded outline-none"
            />

            {results.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-[#1a1a1a] mt-2 rounded shadow-lg max-h-[250px] overflow-y-auto z-50">
                {results.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      navigate(`/folders/${note.folderId}/notes/${note.id}`);
                      setIsSearching(false);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-[#2a2a2a]"
                  >
                    {highlightText(note.title, searchQuery)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RECENTS */}
      <div className="mb-6">
        <p className="px-5 text-sm text-white font-semibold mb-2">Recents</p>
        <ul>
          {recents.map((note) => (
            <li
              key={note.id}
              onClick={() =>
                navigate(`/folders/${note.folder.id}/notes/${note.id}`)
              }
              className="w-full flex items-center gap-3 px-5 py-2 cursor-pointer hover:bg-[#312EB5] transition"
            >
              <img src={documentIcon1} />
              <span className="truncate">{note.title}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* FOLDERS */}
      <div className="flex flex-col flex-1 min-h-0 mb-5">
        <div className="flex justify-between items-center px-5 mb-2">
          <p className="text-sm text-white font-semibold">Folders</p>
          <button onClick={() => setShowInput(true)}>
            <img src={newfolder} />
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto scrollbar">
          {showInput && (
            <li className="px-5 py-2">
              <input
                autoFocus
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFolder()}
                className="w-full bg-[#1f1f1f] px-3 py-2 rounded outline-none"
                placeholder="My New Folder"
              />
            </li>
          )}

          {folders.filter(f => !f.deletedAt).map((item) => {
            const isActive = location.pathname.startsWith(`/folders/${item.id}`);
            return (
              <li
                key={item.id}
                className={`group w-full flex justify-between items-center px-5 py-2 cursor-pointer ${
                  isActive ? "bg-[#1f1f1f]" : "hover:bg-[#1f1f1f]"
                }`}
                onClick={() =>
                  editingFolderId !== item.id &&
                  navigate(`/folders/${item.id}`)
                }
                onDoubleClick={() => {
                  setEditingFolderId(item.id);
                  setEditedName(item.name);
                }}
              >
                <div className="flex items-center gap-3 w-full overflow-hidden">
                  <img
                    src={isActive ? foldericon : simpfolder}
                    className="w-5 h-5"
                  />
                  {editingFolderId === item.id ? (
                    <input
                      autoFocus
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") renameFolder(item.id);
                        if (e.key === "Escape") setEditingFolderId(null);
                      }}
                      className="bg-[#2a2a2a] px-2 py-1 rounded w-full outline-none"
                    />
                  ) : (
                    <span className="truncate">{item.name}</span>
                  )}
                </div>

                <Trash2
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(item.id);
                  }}
                />
              </li>
            );
          })}
        </ul>
      </div>

      {/* MORE */}
      <div className="pb-5">
        <p className="px-5 text-sm text-white font-semibold mb-2">More</p>
        <ul>
          <li className="w-full px-5 py-2 hover:bg-[#1f1f1f] cursor-pointer">
            <div className="flex items-center gap-3">
              <img src={favourite} />
              Favorites
            </div>
          </li>
          <li className="w-full px-5 py-2 hover:bg-[#1f1f1f] cursor-pointer">
            <div className="flex items-center gap-3">
              <img src={trash} />
              Trash
            </div>
          </li>
          <li className="w-full px-5 py-2 hover:bg-[#1f1f1f] cursor-pointer">
            <div className="flex items-center gap-3">
              <img src={archieved} />
              Archived Notes
            </div>
          </li>
        </ul>
      </div>

      {/* ADD NOTE MODAL */}
      {form && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#1f1f1f] w-[400px] p-6 rounded-xl flex flex-col gap-4">
            <input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Title"
              className="bg-[#2a2a2a] px-3 py-2 rounded outline-none"
            />
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Description"
              className="bg-[#2a2a2a] px-3 py-2 rounded outline-none"
            />
            <button
              onClick={addNote}
              className="bg-[#312EB5] py-2 rounded text-white"
            >
              Add Note
            </button>
            <button onClick={() => setForm(false)} className="text-gray-400">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;