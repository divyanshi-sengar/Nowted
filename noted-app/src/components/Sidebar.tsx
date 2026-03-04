import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./Sidebar.css";
import { useDebounce } from "../hooks/useDebounce";
import { searchNotes } from "../services/notesservies";
import { highlightText } from "../utils/highlightText";

import { Search, Plus, Trash2 } from "lucide-react";

import archieved from '../images/archieved.svg';
import newfolder from '../images/create-folder.svg';
import documentIcon from '../images/document.svg';
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
  const [form, setForm] = useState(false);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 500);

  const searchRef = useRef<HTMLDivElement>(null);
  

  const getCurrentFolderId = () => {
    const match = location.pathname.match(/\/folders\/([^/]+)/);
    return match ? match[1] : null;
  };

  // Add Note
  const addNote = async () => {
    setForm(true);
    const currentFolderId = getCurrentFolderId();
    if (!currentFolderId || !noteTitle.trim()) return;

    try {
      const response = await fetch(
        "https://nowted-server.remotestate.com/notes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folderId: currentFolderId,
            title: noteTitle,
            content: noteContent,
            isFavorite: false,
            isArchived: false,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create note");
      const data = await response.json();

      setNoteTitle("");
      setNoteContent("");
      setForm(false);

      navigate(`/folders/${currentFolderId}/notes/${data.id}`);
    } catch (error) {
      console.error("Error creating note:", error);
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
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [debouncedQuery]);

  // Close search dropdown when clicking outside
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
        const data = await response.json();
        setFolder(data.folders || []);
      } catch (err) {
        console.error(err);
        alert("Error fetching folders");
      }
    }
    getFolders();
  }, []);

  // Fetch Recent Notes
  useEffect(() => {
    async function getRecentNotes() {
      try {
        const response = await fetch("https://nowted-server.remotestate.com/notes/recent");
        const data = await response.json();
        setrecent(data.recentNotes);
      } catch (err) {
        console.error(err);
        alert("Error fetching recent notes");
      }
    }
    getRecentNotes();
  }, []);

  // Delete Folder
  const deleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`https://nowted-server.remotestate.com/folders/${folderId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete folder");

      setFolder(prev =>
        prev.map(f => f.id === folderId ? { ...f, deletedAt: new Date().toISOString() } : f)
      );
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  // Create Folder
  const createFolder = async () => {
    if (!folderName.trim()) return;
    try {
      await fetch("https://nowted-server.remotestate.com/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName }),
      });

      const response = await fetch("https://nowted-server.remotestate.com/folders");
      const data = await response.json();
      setFolder(data.folders);
      setFolderName("");
      setShowInput(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Rename Folder
  const renameFolder = async (folderId: string) => {
    if (!editedName.trim()) return;
    try {
      await fetch(`https://nowted-server.remotestate.com/folders/${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedName }),
      });

      setFolder(prev =>
        prev.map(f => (f.id === folderId ? { ...f, name: editedName } : f))
      );
      setEditingFolderId(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-full bg-[#121212] text-gray-300 p-5 flex flex-col">

      {/* Header */}
      <div className="flex flex-col gap-[30px] mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <h2 className="text-white font-normal text-[26px] font-[Kaushan_Script]">Nowted</h2>
            <img src={pen} alt="" className="h-[15px] relative -top-[10px]" />
          </div>
          <Search
            size={18}
            className="cursor-pointer"
            onClick={() => { setIsSearching(prev => !prev); setSearchQuery(""); setResults([]); }}
          />
        </div>

        {!isSearching ? (
          <button
            onClick={addNote}
            className="flex items-center justify-center gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] py-2 rounded text-sm font-semibold"
          >
            <Plus size={16} /> Add Note
          </button>
        ) : (
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-[#1f1f1f] px-3 py-2 rounded outline-none text-sm"
            />
            {loading && <div className="absolute top-full left-0 mt-2 text-xs text-gray-400">Searching...</div>}
            {results.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-[#1a1a1a] mt-2 rounded shadow-lg max-h-[250px] overflow-y-auto z-50">
                {results.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => { navigate(`/folders/${note.folderId}/notes/${note.id}`); setIsSearching(false); setSearchQuery(""); setResults([]); }}
                    className="px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] text-sm truncate"
                  >
                    {highlightText(note.title, searchQuery)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recents */}
      <div className="mb-5">
        <p className="text-sm text-white font-semibold mb-1">Recents</p>
        <ul className="list-none p-0 m-0">
          {recents.map((note) => (
            <li
              key={note.id}
              onClick={() => navigate(`/folders/${note.folder.id}/notes/${note.id}`)}
              className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#312EB5] truncate"
            >
              <img src={documentIcon} alt="" />
              <span className="truncate">{note.title || "Untitled"}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Folders */}
      <div className="flex flex-col flex-1 min-h-0 mb-5 mt-2">
        <div className="flex justify-between items-center px-2">
          <p className="text-sm text-white font-semibold mb-1">Folders</p>
          <button onClick={() => setShowInput(true)}>
            <img src={newfolder} alt="" className="cursor-pointer" />
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
          {showInput && (
            <li className="px-[10px] py-[6px]">
              <input
                type="text"
                autoFocus
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFolder()}
                placeholder="My New Folder"
                className="w-full bg-[#1f1f1f] text-white px-2 py-1 rounded outline-none"
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
                className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer transition ${isActive ? "bg-[#1f1f1f]" : "hover:bg-[#1f1f1f]"}`}
              >
                <div className="flex items-center gap-[10px] w-full py-[5px] overflow-hidden">
                  <img src={isActive ? foldericon : simpfolder} className="transition-all duration-200" />
                  {editingFolderId === item.id ? (
                    <input
                      autoFocus
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") renameFolder(item.id);
                        if (e.key === "Escape") setEditingFolderId(null);
                      }}
                      className="bg-[#2a2a2a] text-white px-2 py-1 rounded outline-none w-full"
                    />
                  ) : (
                    <span className="font-semibold truncate">{item.name}</span>
                  )}
                </div>

                <Trash2
                  className="w-5 h-5 cursor-pointer text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition duration-200"
                  onClick={(e) => { e.stopPropagation(); deleteFolder(item.id); }}
                />
              </li>
            );
          })}
        </ul>
      </div>

      {/* More */}
      <div>
        <p className="text-sm text-white font-semibold mb-1">More</p>
        <ul className="list-none p-0 m-0">
          <li className="flex items-center gap-[10px] px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f] truncate" onClick={() => navigate("/favorites")}>
            <img src={favourite} alt="" /> <span className="truncate">Favorites</span>
          </li>
          <li className="flex items-center gap-[10px] px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f] truncate" onClick={() => navigate("/trash")}>
            <img src={trash} alt="" /> <span className="truncate">Trash</span>
          </li>
          <li className="flex items-center gap-[10px] px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f] truncate" onClick={() => navigate("/archived")}>
            <img src={archieved} alt="" /> <span className="truncate">Archived Notes</span>
          </li>
        </ul>
      </div>

      {/* Add Note Modal */}
      {form && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-[#1f1f1f] w-[400px] p-8 rounded-xl shadow-lg flex flex-col gap-6">
            <h2 className="text-white text-2xl font-semibold text-center">Add Note</h2>
            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Title</label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter note title"
                className="bg-[#2a2a2a] text-white px-3 py-2 rounded-md outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Description</label>
              <textarea
                rows={4}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter note description"
                className="bg-[#2a2a2a] text-white px-3 py-2 rounded-md outline-none resize-none"
              />
            </div>
            <button
              onClick={addNote}
              className="bg-[#312EB5] hover:bg-[#2623a0] text-white py-2 rounded-md font-semibold transition duration-300"
            >
              Add Note
            </button>
            <button
              onClick={() => setForm(false)}
              className="text-gray-400 text-sm hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;