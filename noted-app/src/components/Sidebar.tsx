import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css"
import './Form'

import archieved from '../images/archieved.svg';
import newfolder from '../images/create-folder.svg';
import document from '../images/document.svg';
import favourite from '../images/favourite.svg';
import foldericon from '../images/folder-icon.svg';
import simpfolder from '../images/simp-folder.svg';
import trash from '../images/trash.svg';
import pen from '../images/Vector.svg';
import search from '../images/Frame (1).svg';


interface Folder {
  id: string;
  name: string;
  createdAt: string,
  updatedAt: string,
  deletedAt?: string | null
}



const Sidebar = () => {

  const [folderName, setFolderName] = useState('');
  const [showInput, setShowInput] = useState(false);
  // const [notes, setNotes] = useState([]);
  const [folder, setFolder] = useState<Folder[]>([]);
  const [recents, setrecent] = useState<Folder[]>([]);
  const [form, setForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function getRecentNotes() {
      try {
        const response = await fetch(
          "https://nowted-server.remotestate.com/notes/recent"
        );
        const users = await response.json();
        // console.log(users.recentNotes.title);
        setrecent(users.recentNotes)
        console.log(users.recentNotes);
        // console.log(recents)
      } catch (err) {
        alert("Error fetching folders");
        console.log(err);
      }
    }
    getRecentNotes()
  }, []);

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
      setShowInput(false);

    } catch (error) {
      console.log("Error creating folder", error);
    }
  };

  useEffect(() => {
    async function getFolders() {
      try {
        const response = await fetch(
          "https://nowted-server.remotestate.com/folders"
        );
        const users = await response.json();
        // console.log(users.folders);
        setFolder(users.folders);
      } catch (err) {
        alert("Error fetching folders");
        console.log(err);
      }
    }
    getFolders();
  }, []);

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
            <img
              src={search}
              alt=""
              className="h-[18px] cursor-pointer"
            />
          </div>
        </div>

        <button onClick={() => setForm(true)} className="bg-[#1f1f1f] text-white px-[10px] py-[10px] rounded-[3px] font-semibold text-base cursor-pointer transition duration-300 hover:bg-[#2a2a2a]">
          + New Note
        </button>
      </div>

      {/* Recents */}
      <div className="mb-5">
        <p className="text-sm text-white font-semibold mb-1">Recents</p>
        <ul className="list-none p-0 m-0">
          {recents.map((note: any) => (
            <li
              key={note.id}
              onClick={() =>
                navigate(`/folders/${note.folder.id}/notes/${note.id}`)
              }
              className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#312EB5]"
            >
              <img src={document} alt="" />
              {note.title || "Untitled"}
            </li>
          ))}

        </ul>
      </div>

      {/* Folders Section (Scrollable & scrollbar hidden) */}
      <div className="flex flex-col flex-1 min-h-0 mb-5 mt-2">
        <div className="flex justify-between items-center">
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

          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f] hover:text-white">
            <img src={foldericon} alt="" />
            Personal
          </li>

          {folder.map((item) => (
            <li
              key={item.id}
              onClick={() => navigate(`/folders/${item.id}`)}
              className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f] hover:text-white"
            >
              <img src={simpfolder} alt="" />
              {item.name}
            </li>
          ))}
        </ul>
      </div>

      {/* More */}
      <div>
        <p className="text-sm text-white font-semibold mb-1">More</p>
        <ul className="list-none p-0 m-0">
          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f]">
            <img src={favourite} alt="" />
            Favorites
          </li>
          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f]">
            <img src={trash} alt="" />
            Trash
          </li>
          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f]">
            <img src={archieved} alt="" />
            Archived Notes
          </li>
        </ul>
      </div>

      {form && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-[#1f1f1f] w-[400px] p-8 rounded-xl shadow-lg flex flex-col gap-6">

            <h2 className="text-white text-2xl font-semibold text-center">
              Add Note
            </h2>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Title</label>
              <input
                type="text"
                placeholder="Enter note title"
                className="bg-[#2a2a2a] text-white px-3 py-2 rounded-md outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Description</label>
              <textarea
                rows={4}
                placeholder="Enter note description"
                className="bg-[#2a2a2a] text-white px-3 py-2 rounded-md outline-none resize-none"
              />
            </div>

            <button
              className="bg-[#312EB5] hover:bg-[#2623a0] text-white py-2 rounded-md font-semibold transition duration-300">
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
      )}
    </div>
  );
};

export default Sidebar;