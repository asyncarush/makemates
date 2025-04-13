"use client";

import { AudioLinesIcon, User, VideoIcon } from "lucide-react";
import { useContext, useEffect, useState, useRef } from "react";

const Page = () => {
  const [friends, setFriends] = useState([
    {
      id: 1,
      name: "Arush Sharma",
    },
  ]);

  return (
    <div className="flex w-[1000px] h-[700px] rounded-lg overflow-hidden">
      {/* All friends will be left */}
      <div className="w-[300px] flex flex-col bg-indigo-900 text-white overflow-auto">
        <div className="pl-6 flex items-center justify-center pt-2 h-[60px]">
          <h3 className="font-bold">Your Friends</h3>
        </div>
        {/* List All Friends */}
        <ul className="flex flex-col text-sm gap-4 bg-indigo-900/85">
          <li className="flex items-center justify-center gap-2 cursor-pointer p-2 transition-all duration-150 ease-out hover:bg-indigo-300 hover:shadow-md hover:text-black">
            <User /> Arush Sharma
          </li>
          <li className="flex items-center justify-center gap-2 cursor-pointer p-2 transition-all duration-150 ease-out hover:bg-indigo-300 hover:shadow-md hover:text-black">
            <User /> Abhay Sharma
          </li>
        </ul>
      </div>

      {/* Chat Box */}
      <div className="flex flex-col w-[800px] bg-indigo-900">
        <div className="pl-6 flex h-[60px] text-white w-full items-center justify-between">
          <div className="font-bold">Arush Sharma</div>
          <div className="flex items-center gap-4 mr-12 ">
            <div className="flex mr-4 items-center justify-center gap-2">
              <VideoIcon /> Video Call
            </div>
            <div className="flex items-center justify-center gap-2">
              {" "}
              <AudioLinesIcon /> Audio Call
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-[740px] w-full bg-blue-100"></div>
      </div>
    </div>
  );
};

export default Page;
