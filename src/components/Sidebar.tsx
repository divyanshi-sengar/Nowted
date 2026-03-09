import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NotesContext } from "../context/NotesContext";
import { ThemeContext } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

import "./Sidebar.css";
import "../index.css"
import { useDebounce } from "../hooks/useDebounce";
import { searchNotes } from "../services/notesservies";
import { highlightText } from "../utils/highlightText";

import { Search, Plus, Trash2 } from "lucide-react";

import archieved from '../images/archieved.svg';
import newfolder from '../images/create-folder.svg';
// import documentIcon from '../images/document.svg';
import documentIcon1 from '../images/document1.svg';
import favourite from '../images/favourite.svg';
import foldericon from '../images/folder-icon.svg';
import simpfolder from '../images/simp-folder.svg';
import trash from '../images/trash.svg';
import pen from '../images/Vector.svg';

interface Note {
  id: string;
  folderId: string;
  title: string;
}

interface Folder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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
  const [folderName, setFolderName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [folder, setFolder] = useState<Folder[]>([]);
  const [recents, setrecent] = useState<RecentNote[]>([]);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { refresh, toggleRefresh } = useContext(NotesContext);

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 500);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isFavorites = location.pathname === "/favorites";
  const isTrash = location.pathname === "/trash";
  const isArchived = location.pathname === "/archived";

  // Get Current Folder Id
  const getCurrentFolderId = () => {
    const match = location.pathname.match(/\/folders\/([^/]+)/);
    return match ? match[1] : null;
  };

  // Add Note
  const addNote = async () => {
    const currentFolderId = getCurrentFolderId();
    if (!currentFolderId) {
      toast.warn("Please select a folder first");
      return;
    }

    try {
      const response = await fetch(
        "https://nowted-server.remotestate.com/notes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folderId: currentFolderId,
            title: "",
            content: "",
            isFavorite: false,
            isArchived: false,
          }),
        }
      );

      if (!response.ok) throw new Error();

      const data = await response.json();

      toast.success("New note created");
      navigate(`/folders/${currentFolderId}/notes/${data.id}`);
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    }
  };

  // Search Notes
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

        if (notes.length === 0) {
          toast.info("No notes found");
        }
      } catch (error) {
        console.error("Search failed:", error);
        toast.error("Search failed");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [debouncedQuery]);

  // Close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Folders
  useEffect(() => {
    async function getFolders() {
      try {
        const response = await fetch("https://nowted-server.remotestate.com/folders");
        if (!response.ok) throw new Error();

        const data = await response.json();
        setFolder(data.folders || []);

        toast.success("Folders loaded");

        if (location.pathname === "/" && data.folders?.length > 0) {
          navigate(`/folders/${data.folders[0].id}`);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching folders");
      }
    }
    getFolders();
  }, [refresh]);

  // Fetch Recent Notes
  useEffect(() => {
    async function getRecentNotes() {
      try {
        const response = await fetch("https://nowted-server.remotestate.com/notes/recent");
        if (!response.ok) throw new Error();

        const data = await response.json();
        setrecent(data.recentNotes);

      } catch (err) {
        console.error(err);
        toast.error("Error fetching recent notes");
      }
    }
    getRecentNotes();
  }, []);

  // Delete Folder
  // const deleteFolder = async (folderId: string) => {
  //   try {
  //     // ✅ Get folder name first
  //     const folderToDelete = folder.find(f => f.id === folderId);
  //     const folderName = "Folder " + folderToDelete?.name || "Folder";

  //     const response = await fetch(
  //       `https://nowted-server.remotestate.com/folders/${folderId}`,
  //       { method: "DELETE" }
  //     );
  //     if (!response.ok) throw new Error();

  //     setFolder(prev =>
  //       prev.map(f =>
  //         f.id === folderId
  //           ? { ...f, deletedAt: new Date().toISOString() }
  //           : f
  //       )
  //     );

  //     // ✅ Template string with backticks
  //     toast.success(`"${folderName}" deleted`, {
  //       autoClose: 2000,
  //       onClose: () => navigate("/")
  //     });

  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to delete folder");
  //   }
  // };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      const response = await fetch(
        `https://nowted-server.remotestate.com/folders/${folderToDelete.id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error();

      setFolder(prev =>
        prev.map(f =>
          f.id === folderToDelete.id
            ? { ...f, deletedAt: new Date().toISOString() }
            : f
        )
      );

      toast.success(`"${folderToDelete.name}" deleted`);

      setTimeout(() => {
        toggleRefresh();
        navigate("/");
      }, 0);

    } catch (err) {
      console.error(err);
      toast.error("Failed to delete folder");
    } finally {
      setShowConfirm(false);
      setFolderToDelete(null);
    }
  };

  // Create Folder
  const createFolder = async () => {
    if (!folderName.trim()) {
      toast.warn("Folder name cannot be empty");
      return;
    }

    try {
      await fetch("https://nowted-server.remotestate.com/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName }),
      });

      const response = await fetch("https://nowted-server.remotestate.com/folders");
      if (!response.ok) throw new Error();

      const data = await response.json();
      setFolder(data.folders);

      toast.success(`Folder "${folderName}" created`);
      setFolderName("");
      setShowInput(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create folder");
    }
  };

  // Rename Folder
  const renameFolder = async (folderId: string) => {
    if (!editedName.trim()) {
      toast.warn("Folder name cannot be empty");
      return;
    }

    try {
      await fetch(
        `https://nowted-server.remotestate.com/folders/${folderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editedName }),
        }
      );

      setFolder(prev =>
        prev.map(f =>
          f.id === folderId ? { ...f, name: editedName } : f
        )
      );

      toast.success(`Folder renamed to "${editedName}"`);
      setEditingFolderId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to rename folder");
    }
  };

  const getCurrentNoteId = () => {
    const match = location.pathname.match(/\/notes\/([^/]+)/);
    return match ? match[1] : null;
  };

  const currentNoteId = getCurrentNoteId();

  return (
    <div className="h-full bg-main text-main flex flex-col">

      {/* Header */}
      <div className="px-5 pt-5 mb-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-main font-normal text-[26px] font-[Kaushan_Script]">Nowted</h2>
            <img src={pen} alt="" className="h-[15px] relative -mt-3 icon-theme" />
            <div
              onClick={toggleTheme}
              title="Toggle theme"
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              {/* Sun */}
              <Sun
                size={16}
                className="text-main opacity-80"
              />

              {/* Slider Track */}
              <div
                className={`w-12 h-6 flex items-center rounded-full p-1 border transition-all duration-300
      ${theme === "dark"
                    ? "bg-primary border-primary"
                    : "bg-primary border-theme"}`}
              >
                {/* Slider Knob */}
                <div
                  className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300
        ${theme === "dark"
                      ? "bg-white translate-x-6"
                      : "bg-black translate-x-0"}`}
                />
              </div>

              {/* Moon */}
              <Moon
                size={16}
                className="text-main opacity-80"
              />
            </div>
          </div>
          <Search
            size={18}
            className="cursor-pointer"
            onClick={() => {
              setIsSearching(prev => {
                const newValue = !prev;
                if (!prev) {
                  // If opening search, focus the input after render
                  setTimeout(() => searchInputRef.current?.focus(), 0);
                }
                return newValue;
              });
              setSearchQuery("");
              setResults([]);
            }}
          />
        </div>

        {!isSearching ? (
          <button
            onClick={addNote}
            className="flex items-center justify-center gap-2 bg-panel hover:bg-main-hover py-2 rounded text-sm font-semibold"
          >
            <Plus size={16} /> Add Note
          </button>
        ) : (
          <div className="relative" ref={searchRef}>
            <input
              ref={searchInputRef}
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-panel px-3 py-2 rounded outline-none text-sm"
            />
            {loading && <div className="absolute top-full left-0 mt-2 text-xs text-muted">Searching...</div>}
            {results.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-card mt-2 rounded shadow-lg max-h-[250px] overflow-y-auto z-50 border border-theme">                {results.map((note) => (
                <div
                  key={note.id}
                  onClick={() => { navigate(`/folders/${note.folderId}/notes/${note.id}`); setIsSearching(false); setSearchQuery(""); setResults([]); }}
                  className="px-3 py-2 cursor-pointer hover:bg-primary text-sm truncate text-main"                >
                  {highlightText(note.title, searchQuery)}
                </div>
              ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recents */}
      <div className="mb-6">
        <p className="px-5 text-sm text-main font-semibold mb-2">Recents</p>
        {/* <ul className="list-none p-0 m-0"> */}
        <ul>
          {recents.map((note) => {
            const isActive = currentNoteId === note.id;

            return (
              <li
                key={note.id}
                onClick={() => navigate(`/folders/${note.folder.id}/notes/${note.id}`)}
                className={`w-full flex items-center font-semibold gap-3 px-5 py-2 cursor-pointer transition
        ${isActive ? "bg-primary" : "hover:bg-primary"}`}
              >
                <img src={documentIcon1} alt="" className="icon-theme" />
                <span className="truncate">{note.title || "Untitled"}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Folders */}
      <div className="flex flex-col flex-1 min-h-0 mb-5 ">
        <div className="flex justify-between items-center px-5 mb-2">
          <p className="text-sm text-main font-semibold ">Folders</p>
          <button onClick={() => setShowInput(true)}>
            <img src={newfolder} alt="" className="cursor-pointer icon-theme" />
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto scrollbar space-y-1">
          {showInput && (
            <li className="px-5 py-2">
              <input
                type="text"
                autoFocus
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFolder()}
                placeholder="My New Folder"
                className="w-full bg-panel text-main px-3 py-2 rounded outline-none"
              />
            </li>
          )}

          {folder.filter(f => !f.deletedAt).map((item) => {
            const isActive = location.pathname.startsWith(`/folders/${item.id}`);
            return (
              <li
                key={item.id}
                onClick={() => editingFolderId !== item.id && navigate(`/folders/${item.id}`)}
                onDoubleClick={() => { setEditingFolderId(item.id); setEditedName(item.name); }}
                className={`group w-full flex justify-between items-center px-5 py-1 cursor-pointer 
  ${isActive ? "bg-primary" : "hover:bg-primary"}`}          >
                <div className="flex items-center gap-3 w-full  py-[5px] overflow-hidden">
                  <img src={isActive ? foldericon : simpfolder} className="transition-all duration-200 w-5 h-5 flex-shrink-0 icon-theme" />
                  {editingFolderId === item.id ? (
                    <input
                      autoFocus
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") renameFolder(item.id);
                        if (e.key === "Escape") setEditingFolderId(null);
                      }}
                      className="bg-main-hover px-2 py-1 rounded w-full outline-none"
                    />
                  ) : (
                    <span className="font-semibold truncate ">{item.name}</span>
                  )}
                </div>

                <Trash2
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolderToDelete(item);
                    setShowConfirm(true);
                  }}
                />
              </li>
            );
          })}
        </ul>
      </div>

      {/* More */}
      <div className="pb-5">
        <p className="px-5 text-sm text-main font-semibold mb-2">More</p>
        <ul>
          <li
            onClick={() => navigate("/favorites")}
            className={`flex items-center font-semibold gap-[10px] px-5 py-2 rounded cursor-pointer truncate
      ${isFavorites ? "bg-primary" : "hover:bg-primary"}`}
          >
            <img src={favourite} alt="" className="icon-theme" />
            <span className="truncate">Favorites</span>
          </li>

          <li
            onClick={() => navigate("/trash")}
            className={`flex items-center font-semibold gap-[10px] px-5 py-2 rounded cursor-pointer truncate
      ${isTrash ? "bg-primary" : "hover:bg-primary"}`}
          >
            <img src={trash} alt="" className="icon-theme" />
            <span className="truncate">Trash</span>
          </li>

          <li
            onClick={() => navigate("/archived")}
            className={`flex items-center font-semibold gap-[10px] px-5 py-2 rounded cursor-pointer truncate
      ${isArchived ? "bg-primary" : "hover:bg-primary"}`}
          >
            <img src={archieved} alt="" className="icon-theme" />
            <span className="truncate">Archived Notes</span>
          </li>
        </ul>
      </div>
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card text-main w-[380px] rounded-lg shadow-xl p-6">

            <h3 className="text-lg font-semibold mb-2">
              Delete Folder
            </h3>

            <p className="text-sm text-muted mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{folderToDelete?.name}"</span>?
              <br />
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-panel hover:bg-main-hover"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteFolder}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}
      <ToastContainer position="top-center" autoClose={2000} />

    </div>
  );
};

export default Sidebar;