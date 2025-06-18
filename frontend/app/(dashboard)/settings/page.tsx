"use client";

import React, { useContext, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getUserDataById } from "@/axios.config";
import { AuthContext } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";

import UpdateName from "./_component/UpdateName";
import UpdateBirthday from "./_component/updateBirthday";
import UpdateEmail from "./_component/updateEmail";
import UpdatePassword from "./_component/updatePassword";
import UpdateProfilePhoto from "./_component/UpdateProfilePhoto";

// import UpdateMobile from "./_component/updateMobile";
// import UpdateCity from "./_component/updateCity";
// import UpdateState from "./_component/updateState";
// import UpdateCountry from "./_component/updateCountry";

function Page() {
  const { currentUser }: any = useContext(AuthContext);

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["userInfo"],
    queryFn: getUserDataById,
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
        Error loading data
      </div>
    );
  }

  const sections = [
    { id: "profile", label: "Profile" },
    { id: "account", label: "Account" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and privacy settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-200/50 dark:border-gray-600/40">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Profile Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <Image
                  src={currentUser?.img || "/avatar.png"}
                  alt="Profile"
                  className="rounded-2xl object-cover ring-2 ring-white/50 dark:ring-gray-600/50"
                  fill
                  sizes="80px"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {currentUser?.name || "User"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUser?.email || "user@example.com"}
                </p>
              </div>
              <Button
                variant="outline"
                className="bg-white/80 dark:bg-gray-700/80 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/40 rounded-xl"
              >
                Change Photo
              </Button>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-200/50 dark:border-gray-600/40">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Account Settings
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-white/80 dark:bg-gray-700/80 rounded-xl border border-gray-200/90 dark:border-gray-600/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm"
                  placeholder="Enter display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-white/80 dark:bg-gray-700/80 rounded-xl border border-gray-200/90 dark:border-gray-600/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm"
                  placeholder="Enter username"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 bg-white/80 dark:bg-gray-700/80 rounded-xl border border-gray-200/90 dark:border-gray-600/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-red-200/90 dark:border-red-800/70">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
            Danger Zone
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-red-100/90 dark:bg-red-900/90 rounded-xl">
              <h3 className="font-medium text-red-700 dark:text-red-400 mb-2">
                Delete Account
              </h3>
              <p className="text-sm text-red-600 dark:text-red-300 mb-3">
                This action cannot be undone. This will permanently delete your
                account and remove all your data.
              </p>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 rounded-xl"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
