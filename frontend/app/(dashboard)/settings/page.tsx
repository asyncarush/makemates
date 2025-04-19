"use client";

import React, { useContext, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getUserDataById } from "@/axios.config";
import { AuthContext } from "@/app/context/AuthContext";

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
  const [activeSection, setActiveSection] = useState("profile");

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["userInfo"],
    queryFn: getUserDataById,
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        Error loading data
      </div>
    );
  }

  const sections = [
    { id: "profile", label: "Profile" },
    { id: "account", label: "Account" },
  ];

  return (
    <div className="bg-gradient-to-b from-indigo-50/30 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="bg-white p-6 mb-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-center">
          <Image
            src={currentUser.img || "/avatar.png"}
            className="rounded-full border-4 border-white shadow-md"
            width={96}
            height={96}
            alt="Profile"
          />
          <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
            <h1 className="text-2xl font-light text-gray-900">{data.name}</h1>
            <p className="text-sm text-gray-500">{data.email}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 mb-8 md:mb-0 md:mr-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <ul>
                {sections.map((section) => (
                  <li key={section.id} className="border-b last:border-0">
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left py-4 px-6 transition-colors ${
                        activeSection === section.id
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {section.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              {activeSection === "profile" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b">
                    Profile Information
                  </h2>

                  <div className="space-y-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">
                        Your Photo
                      </h3>
                      <UpdateProfilePhoto value={data.img} />
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">
                        Personal Information
                      </h3>
                      <div className="space-y-6">
                        <UpdateName value={data.name} />
                        <UpdateBirthday value={data.dob} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "account" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b">
                    Account Settings
                  </h2>

                  <div className="space-y-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">
                        Email
                      </h3>
                      <UpdateEmail value={data.email} />
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">
                        Password
                      </h3>
                      <UpdatePassword value={data.password} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
