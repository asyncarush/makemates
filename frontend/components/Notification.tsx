import React, { useContext, useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserNotifications } from "@/axios.config";
import { NotificationType } from "@/typings";
import { format } from "date-fns";
import { BellIcon, CheckIcon, XIcon } from "lucide-react";
import Image from "next/image";

export default function Notification() {
  const {
    data: notifications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchUserNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="p-3 w-[380px] max-h-[600px] flex justify-center items-center">
        <div className="animate-spin h-6 w-6 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 w-[380px] max-h-[600px] flex justify-center items-center">
        <p className="text-red-500">Error loading notifications</p>
      </div>
    );
  }

  return (
    <div className="p-3 w-[380px] max-h-[600px] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BellIcon className="text-indigo-600" size={18} />
          <span className="text-base font-medium">Notifications</span>
        </div>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="flex flex-col gap-2">
          {notifications.map((notification: NotificationType) => (
            <div
              key={`${notification.id}${notification.resource_id}`}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                notification.isRead
                  ? "bg-white hover:bg-gray-50 border-gray-100"
                  : "bg-indigo-50 hover:bg-indigo-100 border-indigo-100 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Image
                    src={notification.sender?.img || "/avatar.png"}
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  {!notification.isRead && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-indigo-500 ring-2 ring-white"></span>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      !notification.isRead ? "font-medium" : ""
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 bg-gray-50 rounded-lg p-6">
          <BellIcon size={40} className="mb-3 opacity-30" />
          <p className="text-center">No notifications yet</p>
          <p className="text-xs text-center mt-1 opacity-70">
            When you get notifications, they&apos;ll appear here
          </p>
        </div>
      )}
    </div>
  );
}
