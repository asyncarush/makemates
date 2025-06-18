import { memo, useState } from "react";
import {
  Users,
  TrendingUp,
  Bookmark,
  Plus,
  UserPlus,
  UserCheck,
} from "lucide-react";

const ChannelsList = memo(() => {
  const [channels, setChannels] = useState([
    {
      id: 1,
      name: "Tech Updates",
      avatar: "🖥️",
      followers: "12.5K",
      isFollowing: true,
    },
    {
      id: 2,
      name: "Design Inspirations",
      avatar: "🎨",
      followers: "8.3K",
      isFollowing: false,
    },
    {
      id: 3,
      name: "Daily News",
      avatar: "📰",
      followers: "22K",
      isFollowing: true,
    },
    {
      id: 4,
      name: "Fitness & Health",
      avatar: "💪",
      followers: "5.7K",
      isFollowing: false,
    },
    {
      id: 5,
      name: "Travel Stories",
      avatar: "✈️",
      followers: "14.2K",
      isFollowing: false,
    },
  ]);

  const toggleFollow = (id: number) => {
    setChannels(
      channels.map((channel) =>
        channel.id === id
          ? { ...channel, isFollowing: !channel.isFollowing }
          : channel
      )
    );
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg p-3 mb-4 border border-gray-200/50 dark:border-gray-600/40">
      <div className="flex items-center mb-3">
        <Users className="text-blue-500 dark:text-blue-400 mr-2" size={16} />
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Popular Channels
        </h2>
      </div>

      <div className="space-y-2">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100/90 dark:hover:bg-gray-800/90 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-sm">
                {channel.avatar}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {channel.name}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <TrendingUp size={10} className="mr-1" />
                  <span>{channel.followers} followers</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleFollow(channel.id)}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                channel.isFollowing
                  ? "bg-blue-100/90 dark:bg-blue-900/90 text-blue-600 dark:text-blue-400 hover:bg-blue-200/90 dark:hover:bg-blue-800/90"
                  : "bg-gray-100/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-gray-200/90 dark:hover:bg-gray-700/90"
              }`}
              title={channel.isFollowing ? "Unfollow" : "Follow"}
            >
              {channel.isFollowing ? (
                <UserCheck className="w-3.5 h-3.5" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200/90 dark:border-gray-700/70">
        <button className="text-xs text-blue-500 dark:text-blue-400 flex items-center hover:text-blue-600 dark:hover:text-blue-300 rounded-lg p-1.5 hover:bg-gray-100/90 dark:hover:bg-gray-800/90 transition-colors">
          <Plus size={14} className="mr-1" />
          Discover more channels
        </button>
      </div>
    </div>
  );
});

ChannelsList.displayName = "ChannelsList";

export default ChannelsList;
