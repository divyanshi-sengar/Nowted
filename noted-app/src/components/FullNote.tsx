import React from "react";
import calendar from '../images/calendar-icon.svg'
import simpfolder from '../images/simp-folder.svg'
import dots from '../images/dots.svg'
import { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

const FullNote: React.FC = () => {

  const { noteId } =useParams();
  const [note, setNote] = useState<Note | null>(null);

   useEffect(() => {
    if (!noteId) return;

    async function getNote() {
      try {
        const response = await fetch(
          `https://nowted-server.remotestate.com/notes/${noteId}`
        );

        const data = await response.json();
        // console.log(data)
        setNote(data.note);
      } catch (error) {
        console.log("Error fetching note:", error);
      }
    }

    getNote();
  }, [noteId]);

  return (
    <div className="font-['Source_Sans_Pro']">
      <div className="p-12 flex flex-col gap-4">

        {/* Top Section */}
        <div className="flex justify-between items-center">
          <h1 className="text-[32px] font-semibold">
            {note?.title}
          </h1>

          <button>
            <img
              src={dots}
              alt="menu"
              className="cursor-pointer"
            />
          </button>
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
              { note?.createdAt && 
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