"use client";

import { TrendingUp, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { API_ENDPOINT } from "@/axios.config";

interface TrendingHashtag {
  name: string;
  post_count: number;
  created_at: string;
}

export default function TrendingTopics() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingHashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrendingHashtags = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await axios.get(
        `${API_ENDPOINT}/hashtags/trending?limit=10`,
        { withCredentials: true }
      );
      setTrendingTopics(response.data);
    } catch (error) {
      console.error("Error fetching trending hashtags:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  const handleRefresh = () => {
    fetchTrendingHashtags(true);
  };

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
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg p-1 hover:bg-gray-100/90 dark:hover:bg-gray-800/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : trendingTopics.length > 0 ? (
        <div className="space-y-3">
          {trendingTopics.slice(0, 5).map((topic, index) => (
            <Link
              key={topic.name}
              href={`/hashtag/${topic.name}`}
              className="group cursor-pointer block"
            >
              <div className="flex items-start p-2 rounded-xl hover:bg-gray-100/90 dark:hover:bg-gray-800/90 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                    #{topic.name}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span className="mr-2">Trending #{index + 1}</span>
                    <span>•</span>
                    <span className="ml-2">
                      {topic.post_count.toLocaleString()} posts
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No trending hashtags yet
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Be the first to start a trend!
          </p>
        </div>
      )}

      {trendingTopics.length > 5 && (
        <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <Link
            href="/hashtags/trending"
            className="text-sm text-blue-500 dark:text-blue-400 hover:underline font-medium"
          >
            Show all trending
          </Link>
        </div>
      )}
    </div>
  );
}
