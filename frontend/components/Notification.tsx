import React from "react";

import { NotificationType } from "@/typings";
import { format } from "date-fns";
import { BellIcon } from "lucide-react";
import Image from "next/image";

export default function Notification({
  notifications,
}: {
  notifications: any;
}) {
  return (
    <div className="p-3 w-[360px] max-h-[500px] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 rounded-lg bg-indigo-500 dark:bg-blue-500">
          <BellIcon className="text-white" size={14} />
        </div>
        <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Notifications
        </span>
      </div>

      {notifications.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {notifications.map(
            (notification: NotificationType, index: number) => (
              <div
                key={index}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  notification.isRead
                    ? "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    : "bg-indigo-50 dark:bg-blue-500/10 hover:bg-indigo-100 dark:hover:bg-blue-500/20 border-l-3 border-indigo-500 dark:border-blue-500"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={notification.sender?.img || "/avatar.png"}
                      alt="User"
                      width={32}
                      height={32}
                      className="rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    {!notification.isRead && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-indigo-500 dark:bg-blue-500 ring-1.5 ring-white dark:ring-gray-900"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-tight truncate ${
                        !notification.isRead
                          ? "font-medium text-gray-900 dark:text-gray-100"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                      title={notification.message}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
        <div className="flex flex-col items-center justify-center h-[250px] text-center">
          <div className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
            <BellIcon size={20} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="font-medium text-gray-600 dark:text-gray-400 mb-1 text-sm">
            No notifications
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            You&apos;re all caught up
          </p>
        </div>
      )}
    </div>
  );
}
