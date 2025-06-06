"use client";

import React, { useState } from "react";
import Loader from "./Loader";

export default function LoaderExample() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="p-6">
      {loading ? (
        <div className="bg-white/50 rounded-lg shadow p-4 mb-4">
          <Loader />
        </div>
      ) : (
        <div className="bg-white/50 rounded-lg shadow p-4 mb-4">
          <h1 className="text-2xl font-bold">Content Loaded!</h1>
          <p className="mt-2">Your content has finished loading.</p>
        </div>
      )}

      {/* Buttons to toggle loader */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setLoading(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          Show Loader
        </button>
        <button
          onClick={() => setLoading(false)}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          disabled={!loading}
        >
          Hide Loader
        </button>
      </div>
    </div>
  );
}
