import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useTheme } from "../context/ThemeContext";
// import { toast, ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import calendar from '../images/calendar-icon.svg'
import simpfolder from '../images/simp-folder.svg'
import dots from '../images/dots.svg'
import archieved from '../images/archieve1.svg'
import deleteicon from '../images/deleteicon.svg';

import "./Sidebar.css";
import { Star } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

interface Note {
  id: string;
  title: string;
  content: string;
  preview?: string;
  createdAt: string;
  folder: {
    id: string;
    name: string;
  };
  isArchived?: boolean;
  isFavorite?: boolean;
  deletedAt?: string | null;
}

interface Folder {
  id: string;
  name: string;
}

interface FullNoteProps {
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

const FullNote: React.FC<FullNoteProps> = ({ setRefreshKey }) => {

  const { noteId } = useParams<{ noteId?: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [folder, setFolder] = useState<Folder[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showMenu, setShowMenu] = useState(false);
  const [note, setNote] = useState<Note | null>(null);

  const debouncedTitle = useDebounce(note?.title, 1000);
  const debouncedContent = useDebounce(note?.content, 1000);
  const isTyping = useRef(false);

  useEffect(() => {
    if (!note?.id) return;
    if (!isTyping.current) return; // <-- only save if user typed

    const updateNote = async () => {
      try {
        setSaveStatus("saving");

        await fetch(`https://nowted-server.remotestate.com/notes/${note.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: debouncedTitle,
            content: debouncedContent,
          }),
        });

        setSaveStatus("saved");
        setRefreshKey((prev) => prev + 1); // <-- now triggers Middle only after typing

        setTimeout(() => setSaveStatus("idle"), 1500);

        isTyping.current = false; // <-- reset after save
      } catch (err) {
        console.error("Autosave failed", err);
        setSaveStatus("idle");
        toast.error("Autosave failed");
      }
    };

    updateNote();
  }, [debouncedTitle, debouncedContent, note?.id, setRefreshKey]);

  useEffect(() => {
    const getFolders = async () => {
      try {
        const response = await fetch("https://nowted-server.remotestate.com/folders");
        const data = await response.json();
        setFolder(data.folders);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load folders");
      }
    };
    getFolders();
  }, []);

  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!noteId) return;
    const fetchNote = async () => {
      try {
        const res = await fetch(`https://nowted-server.remotestate.com/notes/${noteId}`);
        const data: { note: Note } = await res.json();
        setNote(data.note);
      } catch (err) {
        console.error("Error fetching note:", err);
        toast.error("Failed to load note");
      }
    };
    fetchNote();
  }, [noteId]);

  const moveNoteToFolder = async (folderId: string) => {
    if (!note) return;

    try {
      await fetch(`https://nowted-server.remotestate.com/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });

      const selectedFolder = folder.find((f) => f.id === folderId);

      setNote((prev) =>
        prev
          ? {
            ...prev,
            folder: {
              id: folderId,
              name: selectedFolder?.name || "",
            },
          }
          : prev
      );

      navigate(`/folders/${folderId}/notes/${note.id}`);
      setRefreshKey((prev) => prev + 1);

      toast.success(`Moved to "${selectedFolder?.name || "folder"}"`);

    } catch (err) {
      console.error("Move note failed:", err);
      toast.error("Move failed");
    }
  };

  const handleFavourite = async () => {
    if (!note) return;
    const updatedValue = !note.isFavorite;

    try {
      await fetch(`https://nowted-server.remotestate.com/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: updatedValue }),
      });

      setNote(prev => prev ? { ...prev, isFavorite: updatedValue } : prev);
      setRefreshKey(prev => prev + 1);

      if (location.pathname.startsWith("/favorites") && updatedValue === false) {
        navigate("/favorites");
      }

      toast.success(updatedValue ? "Added to favourites" : "Removed from favourites");

    } catch (err) {
      console.error("Favourite toggle failed:", err);
      toast.error("Favourite action failed");
    }
  };

  const handleArchive = async () => {
    if (!note) return;
    const updatedValue = !note.isArchived;
    try {
      await fetch(`https://nowted-server.remotestate.com/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: updatedValue, deletedAt: null }),
      });

      setRefreshKey(prev => prev + 1);
      navigate(`/folders/${note.folder.id}`);

      if (location.pathname.startsWith("/archived") && updatedValue === false) {
        navigate(`/folders/${note.folder.id}`);
      }

      if (updatedValue === true) {
        navigate(`/folders/${note.folder.id}`);
      }

      toast.success(updatedValue ? "Note archived" : "Removed from archive");

    } catch (err) {
      console.error(err);
      toast.error("Archive failed");
    }
  };

  const handleTrash = async () => {
    if (!note) return;
    try {
      // Step 1 — clear states
      await fetch(`https://nowted-server.remotestate.com/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isArchived: false,
          isFavorite: false
        }),
      });

      // Step 2 — soft delete (server sets deletedAt)
      await fetch(`https://nowted-server.remotestate.com/notes/${noteId}`, {
        method: "DELETE"
      });

      navigate(`/folders/${note.folder.id}/restore/${note.id}`);
      setRefreshKey(prev => prev + 1);

      toast.success("Note moved to trash");

    } catch (err) {
      console.error("Trash failed:", err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="font-['Source_Sans_Pro'] h-full bg-main text-main ">
      <div className="p-12 flex flex-col gap-4 h-full">

        {/* Top Section */}
        <div className="flex justify-between items-center gap-4">
          <input
            key={theme}
            value={note?.title || ""}
            placeholder="Untitled"
            onChange={(e) => {
              isTyping.current = true;
              setNote(prev => prev ? { ...prev, title: e.target.value } : prev)
            }}
            className="text-[32px] font-semibold bg-transparent outline-none w-full text-main placeholder:text-muted"
          />
          <div className="flex items-center gap-3">
            {saveStatus === "saving" && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            )}
            {saveStatus === "saved" && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <span>Saved</span>
                <span>✓</span>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={e => { e.stopPropagation(); setShowMenu(!showMenu); }}>
              <img src={dots} alt="menu" className="cursor-pointer icon-theme" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-md shadow-xl z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavourite();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-hover w-full text-left rounded-t-xl"
                >
                  <Star
                    className={`w-5 h-5 transition-all duration-200 icon-theme ${note?.isFavorite
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted"
                      }`}
                  />
                  {note?.isFavorite ? "Remove favourites" : "Add to favourites"}
                </button>

                <button onClick={handleArchive} className="flex items-center gap-3 px-4 py-3 hover:bg-hover w-full text-left">
                  <img src={archieved} alt="" className="icon-theme" /> {note?.isArchived ? "Remove from Archive" : "Archive"}
                </button>

                <hr className="border-gray-600 opacity-40" />

                <button onClick={handleTrash} className="flex items-center gap-3 px-4 py-3 hover:bg-red-600 hover:text-main w-full text-left text-red-400 rounded-b-xl">
                  <img src={deleteicon} alt="" className="icon-theme" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col gap-2 text-sm font-normal ">
          <div className="flex gap-5 text-sm font-semibold item-start">
            <div className="flex gap-3 text-[#a3a3a3] w-[140px]">
              <img src={calendar} alt="calendar" className="icon-theme" />
              <p>Date</p>
            </div>
            <p className="underline">{note?.createdAt && new Date(note.createdAt).toLocaleDateString("en-GB")}</p>
          </div>

          <hr className="border-gray-300 opacity-20 border-1" />

          <div className="flex text-sm font-semibold item start">
            <div className="flex gap-5 text-[#a3a3a3] w-40 flex-shrink-0 truncate ">
              <img src={simpfolder} alt="folder" className="w-5 h-5 object-contain flex-shrink-0 icon-theme" />
              <a>Folder</a>
            </div>
            <Menu as="div" className="relative inline-block">
              <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-menu px-3 py-2 text-sm font-semibold text-main shadow-xs hover:bg-primary ">
                {!note?.folder?.name ? "" : (note?.folder?.name.length > 10 ? note?.folder?.name.slice(0, 10) + "..." : note?.folder?.name)}
                <ChevronDownIcon className="-mr-1 size-5 text-muted" />
              </MenuButton>

              <MenuItems className="absolute left-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-menu shadow-lg">
                <div className="py-1 max-h-48 overflow-y-auto scrollbar">
                  {folder
                    .filter((item) => item.id !== note?.folder?.id)
                    .map((item) => (
                      <MenuItem key={item.id}>
                        <button
                          onClick={() => moveNoteToFolder(item.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-main hover:bg-primary"
                        >
                          {item.name.length > 15 ? item.name.slice(0, 10) + "..." : item.name}
                        </button>
                      </MenuItem>
                    ))}
                </div>
              </MenuItems>
            </Menu>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-2 text-base font-normal leading-7 flex-1">
          <textarea
            key={theme}
            value={note?.content || ""}
            placeholder="Start Typing here..."
            onChange={(e) => {
              isTyping.current = true;
              setNote(prev => prev ? { ...prev, content: e.target.value } : prev)
            }}
            className="w-full h-full bg-transparent text-main outline-none resize-none scrollbar placeholder:text-muted"
          />
        </div>

      </div>

      {/* <ToastContainer position="top-center" autoClose={1000} /> */}
    </div>
  );
};

export default FullNote;