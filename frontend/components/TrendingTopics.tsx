import { TrendingUp, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function TrendingTopics() {
  const [trendingTopics, setTrendingTopics] = useState([
    {
      id: 1,
      tag: "TechWeek2025",
      posts: 2345,
      category: "Technology",
    },
    {
      id: 2,
      tag: "ArtificialIntelligence",
      posts: 1876,
      category: "Tech",
    },
    {
      id: 3,
      tag: "SummerVibes",
      posts: 1532,
      category: "Lifestyle",
    },
    {
      id: 4,
      tag: "WebDevelopment",
      posts: 1245,
      category: "Programming",
    },
    {
      id: 5,
      tag: "HealthTips",
      posts: 987,
      category: "Wellness",
    },
  ]);

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-4 border border-gray-200/50 dark:border-gray-600/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TrendingUp
            className="text-blue-500 dark:text-blue-400 mr-2"
            size={18}
          />
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">
            Trending Now
          </h2>
        </div>
        <button className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg p-1 hover:bg-gray-100/90 dark:hover:bg-gray-800/90 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {trendingTopics.map((topic) => (
          <div key={topic.id} className="group cursor-pointer">
            <div className="flex items-start p-2 rounded-xl hover:bg-gray-100/90 dark:hover:bg-gray-800/90 transition-colors">
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-blue-500 dark:group-hover:text-blue-400">
                  #{topic.tag}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <span className="mr-2">{topic.category}</span>
                  <span>•</span>
                  <span className="ml-2">{topic.posts} posts</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3">
        <button className="text-sm text-blue-500 hover:underline">
          Show more
        </button>
      </div>
    </div>
  );
}
