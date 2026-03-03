import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import calendar from '../images/calendar-icon.svg'
import simpfolder from '../images/simp-folder.svg'
import dots from '../images/dots.svg'
import archieved from '../images/archieved.svg'
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

  const { noteId, folderId } = useParams<{ noteId?: string; folderId?: string }>();
  const navigate = useNavigate();

  const { toggleRefresh } = useContext(NotesContext);

  const [showMenu, setShowMenu] = useState(false);
  const [note, setNote] = useState<Note | null>(null);

  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!noteId) return;

    async function getNote() {
      try {
        const response = await fetch(
          `https://nowted-server.remotestate.com/notes/${noteId}`
        );

        const data: { note: Note } = await response.json();
        // console.log(data)
        setNote(data.note);
      } catch (error) {
        console.log("Error fetching note:", error);
      }
    }

    getNote();
  }, [noteId]);



  const handleArchive = async (): Promise<void> => {
    if (!noteId) return;

    try {
      // Archive the note
      await fetch(`https://nowted-server.remotestate.com/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });

      setRefreshKey(prev => prev + 1);

      if (folderId) {
        navigate(`/folders/${folderId}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Error archiving note:", err);
    }
  };


 const handleFavourite = async (): Promise<void> => {
    if (!noteId || !note) return;

    try {
      await fetch(`https://nowted-server.remotestate.com/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isFavorite: !note.isFavorite,
        }),
      });

      // Update local state instantly (UI update)
      setNote(prev =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : prev
      );

      // Refresh middle pane
      setRefreshKey(prev => prev + 1);

    } catch (err) {
      console.error("Error updating favorite:", err);
    }
  };

  // Delete button 

  const handleDelete = async (): Promise<void> => {
    if (!noteId) return;

    try {
      await fetch(
        `https://nowted-server.remotestate.com/notes/${noteId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isArchived: true,
          }),
        }
      );

      setRefreshKey(prev => prev + 1);

      if (location.pathname.startsWith("/folders")) {
        navigate(`/folders/${folderId}`);
      }
      else if (location.pathname.startsWith("/archived")) {
        navigate("/archived");
      }
      else if (location.pathname.startsWith("/favorites")) {
        navigate("/favorites");
      }
      else if (location.pathname.startsWith("/trash")) {
        navigate("/trash");
      }

    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="font-['Source_Sans_Pro']">
      <div className="p-12 flex flex-col gap-4">

        {/* Top Section */}
        <div className="flex justify-between items-center">
          <h1 className="text-[32px] font-semibold">
            {note?.title}
          </h1>

          {/* Wrap ONLY this section */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <img src={dots} alt="menu" className="cursor-pointer" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#2b2b2b] rounded-md shadow-xl z-50 ">

                <button
                  onClick={handleFavourite}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#3a3a3a] w-full text-left rounded-t-xl"
                >
                  <Star
                    size={18}
                    className={`transition-all ${note?.isFavorite
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400"
                      }`}
                  />

                  {note?.isFavorite ? "Remove favorites" : "Add to favorites"}
                </button>

                <button className="flex items-center gap-3 px-4 py-3 hover:bg-[#3a3a3a] w-full text-left " onClick={handleArchive}>
                  <img src={archieved} alt="" /> Archived
                </button>

                <hr className="border-gray-600 opacity-40" />

                <button className="flex items-center gap-3 px-4 py-3 hover:bg-red-600 hover:text-white w-full text-left text-red-400 rounded-b-xl " onClick={handleDelete}>
                  <img src={deleteicon} alt="" /> Delete
                </button>

              </div>
            )}
          </div>
        </div>


        {/* Middle Section */}
        <div className="flex flex-col gap-2 text-sm font-normal">

          {/* Date */}
          <div className="flex gap-20 text-sm font-semibold">
            <div className="flex gap-3">
              <img src={calendar} alt="calendar" />
              <p>Date</p>
            </div>
            <p className="underline">
              {note?.createdAt &&
                new Date(note.createdAt).toLocaleDateString("en-GB")}
            </p>
          </div>

          <hr className="border-gray-300 opacity-20" />

          {/* Folder */}
          <div className="flex gap-20 text-sm font-semibold">
            <div className="flex gap-5">
              <img src={simpfolder} alt="folder" />
              <p>Folder</p>
            </div>
            <p className="underline">{note?.folder?.name}</p>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-2 text-base font-normal leading-7">
          <p>
            {note?.content}
          </p>
        </div>

      </div>
    </div>
  );
};

export default FullNote;