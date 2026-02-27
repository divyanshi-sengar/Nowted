import { useEffect, useState } from "react";
import "./Sidebar.css"
interface Folder {
  id: string;
  name: string;
}

const Sidebar = () => {
  const [folder, setFolder] = useState<Folder[]>([]);

  useEffect(() => {
    async function getFolders() {
      try {
        const response = await fetch(
          "https://nowted-server.remotestate.com/folders"
        );
        const users = await response.json();
        setFolder(users.folders);
      } catch (err) {
        alert("Error fetching folders");
        console.log(err);
      }
    }
    getFolders();
  }, []);

  return (
    <div className="h-full bg-[#121212] text-gray-300 p-5 flex flex-col gap-5">

      {/* Top Section */}
      <div className="flex flex-col gap-[30px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <h2 className="text-white font-normal text-[26px] font-[Kaushan_Script]">
              Nowted
            </h2>
            <img
              src="src/images/Vector.svg"
              alt=""
              className="h-[15px] relative -top-[10px]"
            />
          </div>
          <div>
            <img
              src="src/images/Frame (1).svg"
              alt=""
              className="h-[18px] cursor-pointer"
            />
          </div>
        </div>

        <button className="bg-[#1f1f1f] text-white px-[10px] py-[10px] rounded-[3px] font-semibold text-base cursor-pointer transition duration-300 hover:bg-[#2a2a2a]">
          + New Note
        </button>
      </div>

      {/* Recents */}
      <div>
        <p className="text-sm text-white font-semibold">Recents</p>
        <ul className="list-none p-0 m-0">
          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#312EB5]">
            <img src="src/images/document.svg" alt="" />
            Reflection on Month of June
          </li>
          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#312EB5]">
            <img src="src/images/document.svg" alt="" />
            Project Proposal
          </li>
          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#312EB5]">
            <img src="src/images/document.svg" alt="" />
            Travel itinerary
          </li>
        </ul>
      </div>

      {/* Folders Section (Scrollable & scrollbar hidden) */}
      <div>
        <div className="flex justify-between">
          <p className="text-sm text-white font-semibold">Folders</p>
          <img
            src="src/images/create-folder.svg"
            alt=""
            className="cursor-pointer"
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-auto scrollbar-hide">
        <ul className="list-none p-0 m-0">
          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f] hover:text-white">
            <img src="src/images/folder-icon.svg" alt="" />
            Personal
          </li>

          {folder.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f] hover:text-white"
            >
              <img src="src/images/simp-folder.svg" alt="" />
              {item.name}
            </li>
          ))}
        </ul>
      </div>

      {/* More */}
      <div>
        <p className="text-sm text-white font-semibold">More</p>
        <ul className="list-none p-0 m-0">
          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f]">
            <img src="src/images/favourite.svg" alt="" />
            Favorites
          </li>
          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f]">
            <img src="src/images/trash.svg" alt="" />
            Trash
          </li>
          <li className="flex items-center gap-[10px] leading-[1.8] font-semibold text-base px-[10px] py-[6px] rounded cursor-pointer hover:bg-[#1f1f1f]">
            <img src="src/images/archieved.svg" alt="" />
            Archived Notes
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;