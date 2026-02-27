import React from "react";

const Middle: React.FC = () => {
  return (
    <div className="p-5 min-h-full bg-[#1c1c1c] flex flex-col gap-5">
      <div className="text-[22px] font-semibold text-white">
        Personal
      </div>

      {[...Array(2)].map((_, index) => (
        <div
          key={index}
          className="bg-[#232323] rounded-[2px] p-5 flex flex-col gap-[15px]"
        >
          <div className="text-[18px] font-semibold leading-[28px] text-white">
            <p className="m-0">My Goals for the Next Year</p>
          </div>

          <div className="flex gap-[10px] text-gray-400 text-sm">
            <p className="m-0">31/12/2022</p>
            <p className="m-0">As the year comes to a ....</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Middle;