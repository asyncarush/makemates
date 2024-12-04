"use client";

import React, { useContext } from "react";
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

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["userInfo"],
    queryFn: getUserDataById,
  });

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div className="w-full flex justify-center bg-slate-200 rounded-md shadow-lg">
      <div className="w-[500px] ">
        <div className="flex justify-center my-4">
          <Image
              src={currentUser.img || "/avatar.png"}
              className="rounded-full"
              width="40"
              height="40"
              alt="Profile pic"
            />
        </div>
        <UpdateProfilePhoto value={data.img} />
        <UpdateName value={data.name} />
        <UpdateEmail value={data.email} />
        <UpdatePassword value={data.password} />
        <UpdateBirthday value={data.dob} />
        {/* <UpdateMobile value={data.mobile_number} /> */}
        {/* <UpdateCity value={data.city} /> */}
        {/* <UpdateState value={data.state} /> */}
        {/* <UpdateCountry value={data.country} /> */}
      </div>
    </div>
  );
}

export default Page;
