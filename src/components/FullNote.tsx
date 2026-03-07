import React, { useState, useEffect,useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

import calendar from '../images/calendar-icon.svg'
import simpfolder from '../images/simp-folder.svg'
import dots from '../images/dots.svg'
import archieved from '../images/archieve1.svg'
import deleteicon from '../images/deleteicon.svg';

import "./Sidebar.css";
import { Star } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

// import { NotesContext } from "../context/NotesContext";

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

  const [folder, setFolder] = useState<Folder[]>([]);

  const [showMenu, setShowMenu] = useState(false);
  const [note, setNote] = useState<Note | null>(null);

  const debouncedTitle = useDebounce(note?.title, 500);
  const debouncedContent = useDebounce(note?.content, 300);

  // const isFirstRender = useRef(true);
  const isTyping = useRef(false);

  useEffect(() => {
    if (!note?.id) return;


    const updateNote = async () => {
      try {
        await fetch(`https://nowted-server.remotestate.com/notes/${note.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: note.title,
            content: note.content
          })
        });

        setRefreshKey(prev => prev + 1);

      } catch (err) {
        console.error("Autosave failed", err);
      }
    };

    updateNote();

  }, [debouncedTitle, debouncedContent,note?.id]);

  useEffect(() => {
    const getFolders = async () => {
      try {
        const response = await fetch("https://nowted-server.remotestate.com/folders");
        const data = await response.json();

        setFolder(data.folders);

      } catch (err) {
        console.log(err);
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

    // find the selected folder
    const selectedFolder = folder.find((f) => f.id === folderId);

    // update local state so UI updates immediately
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


  } catch (err) {
    console.error("Move note failed:", err);
  }
};

  // Toggle favorite
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

      // ⭐ IMPORTANT FIX
      if (location.pathname.startsWith("/favorites") && updatedValue === false) {
        navigate("/favorites");
      }

    } catch (err) {
      console.error("Favourite toggle failed:", err);
    }
  };

  // Archive note
  const handleArchive = async () => {
    if (!note) return;
    const updatedValue = !note.isArchived;
    try {
      await fetch(`https://nowted-server.remotestate.com/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: updatedValue }),
      });

      setRefreshKey(prev => prev + 1);
      navigate(`/folders/${note.folder.id}`);

      if (location.pathname.startsWith("/archived") && updatedValue === false) {
        // navigate("/archived");
        navigate(`/folders/${note.folder.id}`);
      }

      if (updatedValue === true) {
        navigate(`/folders/${note.folder.id}`);
      }

    } catch (err) {
      console.error(err);
    }
  };

  // Trash note → set isArchived + deletedAt
  const handleTrash = async () => {
    if (!note) return;
    try {
      await fetch(`https://nowted-server.remotestate.com/notes/${note.id}`, {
        method: "DELETE",
      });
      // navigate(`/folders/${note.folder.id}/notes/${note.id}`);

      setRefreshKey(prev => prev + 1);
      navigate(`/restore/${note.id}`);
    } catch (err) {
      console.error("Trash failed:", err);
    }
  };

  return (
    <div className="font-['Source_Sans_Pro'] h-full bg-[#121212] text-white ">
      <div className="p-12 flex flex-col gap-4 h-full">

        {/* Top Section */}
        <div className="flex justify-between items-center gap-4">
          {/* <h1 className="text-[32px] font-semibold break-words whitespace-normal overflow-hidden">{note?.title}</h1> */}
          <input
            value={note?.title || ""}
            placeholder="Untitled" 
            onChange={(e) =>{
              isTyping.current=true;
              setNote(prev => prev ? { ...prev, title: e.target.value } : prev)
            }}
            className="text-[32px] font-semibold bg-transparent outline-none w-full break-words whitespace-normal"
          />

          <div className="relative">
            <button onClick={e => { e.stopPropagation(); setShowMenu(!showMenu); }}>
              <img src={dots} alt="menu" className="cursor-pointer" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#2b2b2b] rounded-md shadow-xl z-50">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavourite();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 
             hover:bg-[#3a3a3a] w-full text-left rounded-t-xl"
                >
                  <Star
                    className={`w-5 h-5 transition-all duration-200 ${note?.isFavorite
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-400"
                      }`}
                  />
                  {note?.isFavorite ? "Remove favourites" : "Add to favourites"}
                </button>

                <button onClick={handleArchive} className="flex items-center gap-3 px-4 py-3 hover:bg-[#3a3a3a] w-full text-left">
                  <img src={archieved} alt="" /> {note?.isArchived ? "Remove from Archive" : "Archive"}
                </button>

                <hr className="border-gray-600 opacity-40" />

                <button onClick={handleTrash} className="flex items-center gap-3 px-4 py-3 hover:bg-red-600 hover:text-white w-full text-left text-red-400 rounded-b-xl">
                  <img src={deleteicon} alt="" /> Delete
                </button>

              </div>
            )}
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col gap-2 text-sm font-normal ">
          <div className="flex gap-5 text-sm font-semibold item-start">
            <div className="flex gap-3 text-[#a3a3a3] w-[140px]">
              <img src={calendar} alt="calendar" />
              <p>Date</p>
            </div>
            <p className="underline">{note?.createdAt && new Date(note.createdAt).toLocaleDateString("en-GB")}</p>
          </div>

          <hr className="border-gray-300 opacity-20 border-1" />

          <div className="flex  text-sm font-semibold item start">
            <div className="flex gap-5 text-[#a3a3a3] w-40 flex-shrink-0 truncate ">
              <img src={simpfolder} alt="folder" className="w-5 h-5 object-contain flex-shrink-0" />
              <a >Folder</a>
            </div>
            <Menu as="div" className="relative inline-block">
              <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs hover:bg-[#312EB5] ">
                {!note?.folder?.name ? "" : (note?.folder?.name.length > 10 ? note?.folder?.name.slice(0, 10) + "..." : note?.folder?.name)}
                <ChevronDownIcon className="-mr-1 size-5 text-gray-400" />
              </MenuButton>

              <MenuItems className="absolute left-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg">

                {/* Scrollable container */}
                <div className="py-1 max-h-48 overflow-y-auto scrollbar">
                  {folder
                    .filter((item) => item.id !== note?.folder?.id)
                    .map((item) => (
                      <MenuItem key={item.id}>
                        <button
                          onClick={() => moveNoteToFolder(item.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#312EB5]"
                        >
                          {item.name.length > 10 ? item.name.slice(0, 10) + "..." : item.name}
                        </button>
                      </MenuItem>
                    ))}
                </div>

              </MenuItems>
            </Menu>
            {/* <p className="underline break-words min-w-0"></p> */}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-2 text-base font-normal leading-7  flex-1 ">
          {/* <p>{note?.content}</p> */}

          <textarea
            value={note?.content || ""}
            placeholder="Start writing your note..."
            onChange={(e) =>
              setNote(prev => prev ? { ...prev, content: e.target.value } : prev)
            }
            className="w-full h-full  outline-none resize-none scrollbar"
          />
        </div>

      </div>
    </div >
  );
};

export default FullNote; 