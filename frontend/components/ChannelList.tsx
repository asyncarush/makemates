import { memo, useState } from "react";
import { Users, TrendingUp, Bookmark, Plus } from "lucide-react";

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
    <div className="bg-white/40 rounded-bl-lg shadow p-4 mb-4">
      <div className="flex items-center mb-4">
        <Users className="text-blue-500 mr-2" size={18} />
        <h2 className="text-sm font-semibold text-gray-800">
          Popular Channels
        </h2>
      </div>

      <div className="space-y-3">
        {channels.map((channel) => (
          <div key={channel.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-lg">
                {channel.avatar}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-800">
                  {channel.name}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp size={12} className="mr-1" />
                  <span>{channel.followers} followers</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleFollow(channel.id)}
              className={`text-xs px-2 py-1 rounded-full ${
                channel.isFollowing
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {channel.isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <button className="text-sm text-blue-500 flex items-center">
          <Plus size={16} className="mr-1" />
          Discover more channels
        </button>
      </div>
    </div>
  );
});

ChannelsList.displayName = "ChannelsList";

export default ChannelsList;
