"use client";

import React, { useContext, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

import { BsMessenger } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { API_ENDPOINT } from "@/axios.config";
import { AuthContext } from "@/app/context/AuthContext";
import useFriendList from "@/hooks/useFriendList";
import Posts from "@/components/Posts";

function Page() {
  const friendsList = useFriendList();

  const { currentUser, setCurrentUser }: any = useContext(AuthContext);

  // Current User Log Here -->>> Come again here
  // console.log(currentUser);

  useEffect(() => {
    const getUserData = async () => {
      const { data } = await axios.get(`${API_ENDPOINT}/user/me`, {
        withCredentials: true,
      });
      window.localStorage.setItem("currentUser", JSON.stringify(data));
      setCurrentUser(data);
    };

    getUserData();
  }, [setCurrentUser]);

  useEffect(() => {
    if (currentUser && currentUser.name) {
      const firstName = currentUser.name.split(" ")[0];
      document.title = firstName + "'s feed";
    } else {
      document.title = "Feed";
    }
  }, [currentUser]);

  return currentUser ? (
    <>
      {/* Left SideBar */}
      <div className="fixed top-[100px] w-[300px] flex flex-col gap-4">
        <div className="flex p-2 rounded-md shadow-lg bg-slate-50 items-center justify-start gap-5">
          <Image
            src={currentUser?.img || "/avatar.png"}
            className="rounded-full shadow-lg object-cover"
            alt="Profile pic"
            width="40"
            height="40"
          />
          <div className="flex flex-col">
            <div className="font-semibold text-sm">
              {currentUser?.name || "User"}
            </div>
            <div className="text-xs text-muted-foreground">GhostRider</div>
          </div>
        </div>

        <div className="flex p-2 bg-slate-50 rounded-md shadow-lg tems-center justify-start gap-5">
          <ul className="flex flex-col gap-3 w-full">
            <li className="w-full p-1 hover:bg-purple-100 rounded-md">
              <a
                href="https://codetonic.netlify.app/chat"
                target="_blank"
                className="flex gap-3 items-center justify-start font-medium"
              >
                <BsMessenger className="text-[#003789]" /> Chat
              </a>
            </li>
            <li className="w-full p-1 hover:bg-purple-100 rounded-md">
              <a
                href="https://codetonic.netlify.app/profile/liked_posts"
                target="_blank"
                className="flex gap-3 items-center justify-start font-medium"
              >
                <BsMessenger className="text-[#003789]" /> Liked
              </a>
            </li>
            <li className="w-full p-1 hover:bg-purple-100 rounded-md">
              <a
                href="https://codetonic.netlify.app/login"
                target="_blank"
                className="flex gap-3 items-center justify-start font-medium"
              >
                <BsMessenger className="text-[#003789]" /> Favourites
              </a>
            </li>
            <li className="w-full p-1 hover:bg-purple-100 rounded-md">
              <a
                href="https://codetonic.netlify.app/login"
                target="_blank"
                className="flex gap-3 items-center justify-start font-medium"
              >
                <BsMessenger className="text-[#003789]" /> Saved
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* Middle Feed */}
      <div className="flex gap-4 flex-col w-[500px] ml-[330px]">
        <Posts userId={currentUser?.id} />
      </div>
      <div className="w-[300px] fixed top-[100px] ml-[870px]  rounded-md h-[500px] overflow-y-auto">
        <div>
          <h4 className="font-semibold text-sky-900">Followers :</h4>
          <div className="flex bg-slate-50 gap-2 shadow-md rounded-md flex-col mt-2 w-full ">
            {friendsList.length > 0 ? (
              friendsList.map((friend: any) => {
                return (
                  <HoverCard key={`${friend.follow_id}-${friend.follower_id}`}>
                    <HoverCardTrigger
                      className="flex items-center rounded-md"
                      asChild
                    >
                      <div className="flex justify-between items-center p-2 w-full rounded-mdcursor-pointer">
                        <div className="flex gap-2 items-center">
                          <Image
                            src={friend.profileImage || "/avatar.png"}
                            className="rounded-full shadow-lg object-cover"
                            alt="Profile pic"
                            width="40"
                            height="40"
                          />
                          <span>{friend.name}</span>
                        </div>
                        <div className="mr-2 flex items-ceter">
                          <Link
                            href={`/profile/${friend.follow_id}`}
                            target="_black"
                            className="bg-slate-100 rounded-full p-2"
                          >
                            <FaUser className="text-sky-700 w-4 h-4 " />
                          </Link>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="flex flex-col text-sm mr-[400px] w-[200px]">
                      <div className="flex items-center gap-2">
                        <Image
                          src={friend.profileImage || "/avatar.png"}
                          className="rounded-full shadow-lg object-cover"
                          alt="Profile pic"
                          width="40"
                          height="40"
                        />
                        <span className="font-bold">{friend.name}</span>
                      </div>
                      <div className="text-xs ">Last seen 12 min ago</div>
                    </HoverCardContent>
                  </HoverCard>
                );
              })
            ) : (
              <>
                <div>No Followers</div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  ) : (
    "Loading"
  );
}

export default Page;
