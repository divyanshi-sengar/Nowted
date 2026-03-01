import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Middle: React.FC = () => {

  const [notes, setNotes] = useState([]);
  const [folderName, setFolderName] = useState("");

  const navigate = useNavigate();
  const { folderId } = useParams();

  useEffect(() => {
    if (!folderId) return;

    async function getFolder() {
      try {
        const response = await fetch(
          `https://nowted-server.remotestate.com/notes?folderId=${folderId}`
        );
        const users = await response.json();
        // console.log(users);
        setNotes(users.notes);

        if (users.notes.length > 0) {
          setFolderName(users.notes[0].folder.name);
        } else {
          setFolderName("Empty Folder");
        }

      } catch (err) {
        alert("Error fetching folders");
        console.log(err);
      }
    }
    getFolder();
  }, [folderId])

  return (
    <div className="p-5 min-h-full bg-[#1c1c1c] flex flex-col gap-5">
      <div className="text-[22px] font-semibold text-white">
        {folderName}
      </div>

      {notes.map((note: any) => (
        <div
          key={note.id}
          onClick={() =>
            navigate(`/folders/${folderId}/notes/${note.id}`)
          }
          className="bg-[#232323] rounded-[2px] p-5 flex flex-col gap-[15px]"
        >
          <div className="text-[18px] font-semibold leading-[28px] text-white">
            <p className="m-0">{note.title || "Untitled"}</p>
          </div>

          <div className="flex gap-[10px] text-gray-400 text-sm">
            <p className="m-0">
              {new Date(note.createdAt).toLocaleDateString()}
            </p>
            <span className="truncate">
              {note.preview}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Middle;