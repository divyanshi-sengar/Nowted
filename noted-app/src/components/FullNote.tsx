import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import calendar from '../images/calendar-icon.svg'
import simpfolder from '../images/simp-folder.svg'
import dots from '../images/dots.svg'
import archieved from '../images/archieve1.svg'
import deleteicon from '../images/deleteicon.svg';

import { Star } from "lucide-react";

import { NotesContext } from "../context/NotesContext";

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

interface FullNoteProps {
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

const FullNote: React.FC<FullNoteProps> = ({ setRefreshKey }) => {

  const { noteId } = useParams<{ noteId?: string }>();
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [note, setNote] = useState<Note | null>(null);

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
    try {
      await fetch(`https://nowted-server.remotestate.com/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });
      setRefreshKey(prev => prev + 1);
      navigate(`/folders/${note.folder.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Trash note → set isArchived + deletedAt
  const handleTrash = async () => {
    if (!note) return;
    try {
      await fetch(`https://nowted-server.remotestate.com/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isArchived: true,
          isFavorite: false,
        }),
      });
      setRefreshKey(prev => prev + 1);
      navigate(`/restore/${note.id}`);
    } catch (err) {
      console.error("Trash failed:", err);
    }
  };

  return (
    <div className="font-['Source_Sans_Pro'] h-full bg-[#121212] text-white ">
      <div className="p-12 flex flex-col gap-4">

        {/* Top Section */}
        <div className="flex justify-between items-center">
          <h1 className="text-[32px] font-semibold break-words whitespace-normal overflow-hidden">{note?.title}</h1>

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
                  <img src={archieved} alt="" /> Archived
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
        <div className="flex flex-col gap-2 text-sm font-normal">
          <div className="flex gap-20 text-sm font-semibold">
            <div className="flex gap-3 text-[#a3a3a3]">
              <img src={calendar} alt="calendar" />
              <p>Date</p>
            </div>
            <p className="underline">{note?.createdAt && new Date(note.createdAt).toLocaleDateString("en-GB")}</p>
          </div>

          <hr className="border-gray-300 opacity-20 border-1" />

          <div className="flex gap-20 text-sm font-semibold">
            <div className="flex gap-5 text-[#a3a3a3]">
              <img src={simpfolder} alt="folder" />
              <p>Folder</p>
            </div>
            <p className="underline">{note?.folder?.name}</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-2 text-base font-normal leading-7 break-words whitespace-pre-wrap overflow-hidden">
          <p>{note?.content}</p>
        </div>

      </div>
    </div>
  );
};

export default FullNote; 