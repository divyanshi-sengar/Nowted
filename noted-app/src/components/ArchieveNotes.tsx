import React from 'react'
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";

interface Note {
    id: string;
    title: string;
    preview: string;
    createdAt: string;
    folder: {
        id: string;
        name: string;
    };
}

interface NotesResponse {
    notes: Note[];
}

const ArchieveNotes: React.FC = () => {

    const [notes, setNotes] = useState<Note[]>([]);
    const [folderName, setFolderName] = useState<string>("");

    const { folderId } = useParams<{ folderId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (!folderId) return;

        async function getArchivedNotes() {
            try {
                const response = await fetch(
                    `https://nowted-server.remotestate.com/notes?&isArchived=true`
                );
                const data: NotesResponse = await response.json();
                // console.log(users);
                setNotes(data.notes);

                setFolderName(data.notes.length > 0 ? data.notes[0].folder.name : "Empty Folder");
            } catch (err) {
                alert("Error fetching folders");
                console.log(err);
            }
        }
        
        getArchivedNotes();
    },[folderId])

    return (
        <div className="p-5 min-h-full bg-[#1c1c1c] flex flex-col gap-5">
            <div className="text-[22px] font-semibold text-white">
                {folderName}
            </div>

            {notes.map((note) => (
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


export default ArchieveNotes
