"use client";

import React, { ReactElement, useContext } from "react";
import { TiHome } from "react-icons/ti";
import { BsMessenger } from "react-icons/bs";
import { BiSolidBell } from "react-icons/bi";
import { FaUserAlt } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@radix-ui/react-navigation-menu";
import Image from "next/image";
import Link from "next/link";
import Search from "./Search";

import { AuthContext } from "@/app/context/AuthContext";
import { AuthContextType } from "@/typings";
import FeedUploadBox from "@/app/(dashboard)/feed/_components/FeedUploadBox";

interface navLinks {
  name: string;
  Icon: ReactElement;
  Data?: ReactElement;
}

function Navbar() {
  const { currentUser, userLogout } = useContext<any>(AuthContext);

  const navigation = [
    {
      name: "feed",
      Icon: (
        <Link href="/feed">
          <TiHome className="w-5 h-5 text-white hover:text-white transition-colors" />
        </Link>
      ),
    },
    {
      name: "messenger",
      Icon: (
        <Link href="/chat">
          <BsMessenger className="w-5 h-5 text-white hover:text-white transition-colors" />
        </Link>
      ),
    },
    {
      name: "notifications",
      Icon: (
        <BiSolidBell className="w-5 h-5 text-white hover:text-white transition-colors" />
      ),
    },
    {
      name: "setting",
      Icon: (
        <FaUserAlt className="w-5 h-5 text-white hover:text-white transition-colors" />
      ),
      Data: (
        <div className="p-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="relative w-10 h-10 ring-2 ring-white ring-offset-2 ring-offset-indigo-50">
              <Image
                src={currentUser?.img || "/avatar.png"}
                alt="Profile pic"
                className="rounded-full object-cover"
                fill
                sizes="40px"
                quality={90}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {currentUser?.name}
              </span>
              <span className="text-sm text-indigo-600">
                @{currentUser?.name?.toLowerCase().replace(/\s+/g, "")}
              </span>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <Link
              href="/settings"
              className="flex items-center justify-between p-2 rounded-md hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition-all duration-200"
            >
              <span className="text-sm font-medium">Settings</span>
              <IoSettingsSharp className="w-4 h-4" />
            </Link>
            <button
              onClick={() => userLogout()}
              className="w-full flex items-center justify-between p-2 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200"
            >
              <span className="text-sm font-medium">Logout</span>
              <IoLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <nav className="flex h-16 items-center justify-between px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400 rounded-b-xl">
      {/* Logo and Upload */}
      <div className="flex items-center gap-4">
        <Link
          href="/feed"
          className="text-xl font-bold text-white hover:text-white/90 transition-colors"
        >
          Makemates
        </Link>
        <FeedUploadBox />
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl px-4">
        <Search />
      </div>

      {/* Navigation */}
      <NavigationMenu>
        <NavigationMenuList className="flex items-center gap-2">
          {navigation.map(({ name, Icon, Data }) => (
            <NavigationMenuItem key={name}>
              <NavigationMenuTrigger className="h-10 w-10 p-0 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200">
                {Icon}
              </NavigationMenuTrigger>
              {Data && (
                <NavigationMenuContent className="absolute right-0 mt-2 min-w-[240px] rounded-lg bg-white/95 backdrop-blur-sm p-2 shadow-lg ring-1 ring-black/5">
                  {Data}
                </NavigationMenuContent>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}

export default Navbar;
