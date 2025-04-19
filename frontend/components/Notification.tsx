import React, { useContext, useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserNotifications } from "@/axios.config";
import { NotificationType } from "@/typings";
import { format } from "date-fns";
import { BellIcon, CheckIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { AuthContext } from "@/app/context/AuthContext";
import { ChatContext } from "@/app/context/ChatContext";

interface NotificationProps {
  notificationBadgeRef?: React.RefObject<HTMLDivElement>;
}

export default function Notification({
  notificationBadgeRef,
}: NotificationProps) {
  const queryClient = useQueryClient();
  const { currentUser } = useContext(AuthContext) || {};
  const { socket } = useContext(ChatContext) || {};
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // Fetch notifications using Tanstack Query
  const {
    data: notifications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchUserNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Count unread notifications
  const unreadCount =
    notifications?.filter((notif: NotificationType) => !notif.isRead).length ||
    0;

  // Update the badge in navbar
  useEffect(() => {
    if (notificationBadgeRef?.current) {
      if (unreadCount > 0) {
        notificationBadgeRef.current.innerHTML = `
          <span class="absolute -top-2 -right-2 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-white animate-pulse">
            ${unreadCount > 9 ? "9+" : unreadCount}
          </span>
        `;
      } else {
        notificationBadgeRef.current.innerHTML = "";
      }
    }
  }, [unreadCount, notificationBadgeRef]);

  // Listen for new notifications via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      // When a new notification arrives, invalidate the query to refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket, queryClient]);

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    setIsMarkingRead(true);
    try {
      // Replace with your actual API call to mark all as read
      // await markAllNotificationsAsRead();

      // After successful API call, update the local cache
      queryClient.setQueryData(
        ["notifications"],
        notifications.map((notif: NotificationType) => ({
          ...notif,
          isRead: true,
        }))
      );

      // Emit socket event if needed
      // if (socket) socket.emit("mark_all_read");
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    } finally {
      setIsMarkingRead(false);
    }
  };

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
          {unreadCount > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-medium">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingRead}
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <CheckIcon size={14} />
            {isMarkingRead ? "Marking..." : "Mark all read"}
          </button>
        )}
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="flex flex-col gap-2">
          {notifications.map((notification: NotificationType) => (
            <div
              key={notification.id}
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
