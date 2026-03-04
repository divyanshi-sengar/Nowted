import { useEffect, useState,useRef} from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

import "./Sidebar.css"
import { useDebounce } from "../hooks/useDebounce";
import { searchNotes } from "../services/notesservies";
import { highlightText } from "../utils/highlightText";

import { Search, Plus } from "lucide-react";
// import './Form'

import archieved from '../images/archieved.svg';
import newfolder from '../images/create-folder.svg';
import documentIcon from '../images/document.svg';
import favourite from '../images/favourite.svg';
import foldericon from '../images/folder-icon.svg';
import simpfolder from '../images/simp-folder.svg';
import trash from '../images/trash.svg';
import pen from '../images/Vector.svg';
import { Trash2 } from 'lucide-react';

interface Note {
  id: string;
  folderId: string;
  title: string;
}

interface Folder {
  id: string;
  name: string;
  createdAt: string,
  updatedAt: string,
  deletedAt?: string | null
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
  const [folderName, setFolderName] = useState<string>('');
  const [showInput, setShowInput] = useState(false);
  const [folder, setFolder] = useState<Folder[]>([]);
  const [recents, setrecent] = useState<RecentNote[]>([]);
  const [form, setForm] = useState<boolean>(false);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const location = useLocation();

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 500);

  const getCurrentFolderId = () => {
    const match = location.pathname.match(/\/folders\/([^/]+)/);
    return match ? match[1] : null;
  };

  const navigate = useNavigate();

  // Add notes

  const addNote = async () => {
    setForm(true);
    const currentFolderId = getCurrentFolderId();
    
    if (!currentFolderId) {
      alert("Please select a folder first");
      return;
    }

    if (!noteTitle.trim()) {
      // alert("Title is required");
      return;
    }

    try {
      const response = await fetch(
        "https://nowted-server.remotestate.com/notes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

      console.log("Note created:", data);

      // Reset form
      setNoteTitle("");
      setNoteContent("");
      setForm(false);

      // Navigate 
      navigate(`/folders/${currentFolderId}/notes/${data.id}`);

    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  // search
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

  // close dropdown

  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Fetch Folders*************
  useEffect(() => {
    async function getFolders() {
      try {
        const response = await fetch(
          "https://nowted-server.remotestate.com/folders"
        );
        const users = await response.json();
        // console.log(users.folders);
        setFolder(users.folders || []);
      } catch (err) {
        alert("Error fetching folders");
        console.log(err);
      }
    }
    getFolders();
  }, []);

  // get recent note*****************

  useEffect(() => {
    async function getRecentNotes() {
      try {
        const response = await fetch(
          "https://nowted-server.remotestate.com/notes/recent"
        );
        const users = await response.json();
        // console.log(users.recentNotes.title);
        setrecent(users.recentNotes)
        // console.log(users.recentNotes);
      } catch (err) {
        alert("Error fetching folders");
        console.log(err);
      }
    }
    getRecentNotes()
  }, []);

  // Delete folder**************8

  const deleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(
        `https://nowted-server.remotestate.com/folders/${folderId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete folder");

      console.log("Folder archived successfully");

      // Update folder list after deletion
      setFolder(prev => prev.map(f =>
        f.id === folderId ? { ...f, deletedAt: new Date().toISOString() } : f
      ));
    } catch (err) {
      console.error("Error deleting folder:", err);
    }
  };

  // create folders**************

  const createFolder = async () => {
    if (!folderName.trim()) return;

    try {
      await fetch("https://nowted-server.remotestate.com/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: folderName,
        }),
      });

      const response = await fetch(
        "https://nowted-server.remotestate.com/folders"
      );
      const data = await response.json();
      setFolder(data.folders);

      // Reset input
      setFolderName("");

    } catch (error) {
      console.log("Error creating folder", error);
    }
  };

  // rename folder

  const renameFolder = async (folderId: string) => {
    if (!editedName.trim()) return;

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

      setEditingFolderId(null);
    } catch (error) {
      console.error("Rename failed", error);
    }
  };

  return (
    <div className="h-full bg-[#121212] text-gray-300 p-5 flex flex-col">

      {/* Top Section */}
      <div className="flex flex-col gap-[30px] mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <h2 className="text-white font-normal text-[26px] font-[Kaushan_Script]">
              Nowted
            </h2>
            <img
              src={pen}
              alt=""
              className="h-[15px] relative -top-[10px]"
            />
          </div>
          <div>
            <Search
          size={18}
          className="cursor-pointer"
          onClick={() => {
            setIsSearching(prev => !prev);
            setSearchQuery("");
            setResults([]);
          }}
        />
        </div>
        </div>

         {!isSearching ? (
        <button
          onClick={addNote}
          className="flex items-center justify-center gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] py-2 rounded text-sm font-semibold"
        >
          <Plus size={16}/>
          Add Note
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

          {/* LOADING */}
          {loading && (
            <div className="absolute top-full left-0 mt-2 text-xs text-gray-400">
              Searching...
            </div>
          )}

          {/* result dropdown */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-[#1a1a1a] mt-2 rounded shadow-lg max-h-[250px] overflow-y-auto z-50">
              {results.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    navigate(
                      `/folders/${note.folderId}/notes/${note.id}`
                    );
                    setIsSearching(false);
                    setSearchQuery("");
                    setResults([]);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] text-sm"
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
              onClick={() => {
                navigate(`/folders/${note.folder.id}/notes/${note.id}`);
              }}
              className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#312EB5]"
            >
              <img src={documentIcon} alt="" />
              {note.title || "Untitled"}
            </li>
          ))}

        </ul>
      </div>

      {/* Folders Section (Scrollable & scrollbar hidden) */}

      <div className="flex flex-col flex-1 min-h-0 mb-5 mt-2">
        <div className="flex justify-between items-center px-2">
          <p className="text-sm text-white font-semibold mb-1">Folders</p>
          <button>
            <img
              src={newfolder}
              alt=""
              className="cursor-pointer"
              onClick={() => setShowInput(true)}
            />
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createFolder();
                  }
                }}
                placeholder="My New Folder"
                className="w-full bg-[#1f1f1f] text-white px-2 py-1 rounded outline-none"
              />
            </li>
          )}


          {folder
            .filter((f) => !f.deletedAt)
            .map((item) => {
              const isActive =
                location.pathname.startsWith(`/folders/${item.id}`);

              return (
                <li
                  key={item.id}
                  onClick={() => {
                    if (editingFolderId !== item.id) {
                      navigate(`/folders/${item.id}`);
                    }
                  }}
                  onDoubleClick={() => {
                    setEditingFolderId(item.id);
                    setEditedName(item.name);
                  }}
                  className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer transition
                    ${isActive ? "bg-[#1f1f1f]" : "hover:bg-[#1f1f1f]"}`}
                >
                  <div className="flex items-center gap-[10px] w-full [10px] py-[5px] ">
                    <img
                      src={isActive ? foldericon : simpfolder}
                      className="transition-all duration-200"
                    />

                    {editingFolderId === item.id ? (
                      <input
                        autoFocus
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") renameFolder(item.id);
                          if (e.key === "Escape")
                            setEditingFolderId(null);
                        }}
                        className="bg-[#2a2a2a] text-white px-2 py-1 rounded outline-none w-full"
                      />
                    ) : (
                      <span className="font-semibold truncate">
                        {item.name}
                      </span>
                    )}
                  </div>

                  <Trash2
                    className="w-5 h-5 cursor-pointer text-gray-400 
             opacity-0 group-hover:opacity-100 
             hover:text-red-500 transition duration-200"
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

      {/* More */}
      <div>
        <p className="text-sm text-white font-semibold mb-1">More</p>
        <ul className="list-none p-0 m-0">
          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f]" onClick={() => navigate("/favorites")}>
            <img src={favourite} alt="" />
            Favorites
          </li>
          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f] " onClick={() => navigate("/trash")} >
            <img src={trash} alt="" />
            Trash
          </li>
          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f]"
            onClick={() => {
              navigate("/archived");
            }}
          >

            <img src={archieved} alt="" />
            Archived Notes
          </li>
        </ul>
      </div>

      {
        form && (
          <div className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-[#1f1f1f] w-[400px] p-8 rounded-xl shadow-lg flex flex-col gap-6">

              <h2 className="text-white text-2xl font-semibold text-center">
                Add Note
              </h2>

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

              {/* Close Button */}
              <button
                onClick={() => setForm(false)}
                className="text-gray-400 text-sm hover:text-white"
              >
                Cancel
              </button>

            </div>
          </div>
        )
      }
    </div >
  );
};


export default Sidebar;



