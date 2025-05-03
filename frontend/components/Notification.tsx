import React, { useContext, useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserNotifications } from "@/axios.config";
import { NotificationType } from "@/typings";
import { format } from "date-fns";
import { BellIcon, CheckIcon, XIcon } from "lucide-react";
import Image from "next/image";

export default function Notification({
  notifications,
}: {
  notifications: any;
}) {
  //   {
  //     "id": 45,
  //     "user_reciever_id": 1,
  //     "user_sender_id": 4,
  //     "type": "post",
  //     "resource_id": 39,
  //     "message": "4 has post something in long time. Websocket check",
  //     "isRead": false,
  //     "createdAt": "2025-05-03T09:22:45.537Z",
  //     "sender": {
  //         "name": "Harry Potter",
  //         "img": "https://minio-api.asyncarush.com/posts/profile-pc-1746009665073-profile_pic_1746009662862-Harry Potter.jpeg"
  //     }
  // }

  return (
    <div className="p-3 w-[380px] max-h-[600px] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BellIcon className="text-indigo-600" size={18} />
          <span className="text-base font-medium">Notifications</span>
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="flex flex-col gap-2">
          {notifications.map(
            (notification: NotificationType, index: number) => (
              <div
                key={index}
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
                      {format(
                        new Date(notification.createdAt),
                        "MMM d, h:mm a"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
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
