"use client";

import { ChatContext } from "@/app/context/ChatContext";
import { API_ENDPOINT } from "@/axios.config";
import axios from "axios";
import {
  AudioLinesIcon,
  PlusIcon,
  SearchIcon,
  User,
  VideoIcon,
} from "lucide-react";
import { useContext, useEffect, useState, useRef } from "react";

const Page = () => {
  // const [followList, setFollowList] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [searchToggler, setSearchToggler] = useState(false);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const { socketRef } = useContext(ChatContext) || {};
  const socket = socketRef?.current;

  useEffect(() => {
    const debounce = setTimeout(() => {
      setSearchToggler(true);
      console.log("This will wait for some time", searchUser);

      const getSearchResult = async () => {
        try {
          const res = await axios.get(`${API_ENDPOINT}/chat/search/user`, {
            params: {
              keyword: searchUser,
            },
            withCredentials: true,
          });
          setSearchResult(res.data);
        } catch (error) {
          console.log(error);
        }
      };

      getSearchResult();
    }, 2000);

    return () => clearTimeout(debounce);
  }, [searchUser]);

  return (
    <div className="flex w-[1000px] h-[700px] rounded-lg overflow-hidden">
      {/* All friends will be left */}
      <div className="w-[300px] flex flex-col bg-indigo-900 text-white overflow-auto">
        <div className="px-4 flex w-full items-center justify-between pt-2 h-[60px]">
          <div className="hidden">
            <h3 className="font-bold">Your Friends</h3>
          </div>

          {/* Search User for Chat */}
          <div className="cursor-pointer hidden">
            <PlusIcon />
          </div>

          {/* Search User */}
          <div className="w-full rounded-md">
            <input
              type="text"
              placeholder="Search User"
              className="rounded-md p-2 w-full text-black outline-none text-center"
              onChange={(e) => setSearchUser(e.target.value)}
            />
          </div>

          {/* Add Friend */}
        </div>

        {/* Search result */}
        <div
          className={`${
            searchUser ? "flex" : "hidden"
          } flex-col gap-4 bg-white/80 text-black`}
        >
          {searchResult.length > 0 &&
            searchResult.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-center gap-2 cursor-pointer p-2 transition-all duration-150 ease-out hover:bg-indigo-300 hover:shadow-md hover:text-black"
              >
                <User /> {user.name}
              </div>
            ))}
        </div>

        {/* List All Friends */}
        <ul
          className={`${
            searchUser ? "hidden" : "flex"
          } flex-col text-sm gap-4 bg-indigo-900/85`}
        >
          {/* All Chats will come here */}
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
