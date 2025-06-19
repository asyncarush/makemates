import React from "react";
import { AuthContext } from "@/app/context/AuthContext";
import { SendIcon } from "lucide-react";
import Image from "next/image";
import { useContext, useState } from "react";
import { useNewComment } from "@/lib/mutations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPostComments } from "@/axios.config";
import Comment from "./Comment";

export function Comments({
  postId,
  onCommentAdded,
}: {
  postId: any;
  onCommentAdded?: () => void;
  onCommentRemoved?: () => void;
}) {
  const queryClient = useQueryClient();
  const { currentUser }: any = useContext(AuthContext);
  const [desc, setDesc] = useState("");
  const mutation = useNewComment();

  const handleComment = () => {
    if (!desc.trim()) return;
    mutation.mutate({ desc, postId });
    onCommentAdded?.();
    queryClient.invalidateQueries({ queryKey: ["newComment"] });
    setDesc("");
  };

  const {
    data: allComments,
    isLoading,
    error,
  }: any = useQuery({
    queryKey: ["newComment", postId],
    queryFn: ({ queryKey }) => fetchPostComments(queryKey[1]),
  });

  if (isLoading) {
    return (
      <div className="text-xs flex items-center justify-center p-2">
        Loading all comments 🪄
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="">
      <div className="flex flex-col gap-2">
        {allComments &&
          allComments.map((cmnt: any) => <Comment key={cmnt.id} cmnt={cmnt} />)}
      </div>

      <div className="flex w-full p-2 items-center gap-2">
        <Image
          src={currentUser.img || "/avatar.png"}
          className="rounded-full bg-gray-100"
          width="26"
          height="26"
          alt="Your profile picture"
        />
        <div className="relative flex items-center w-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full shadow px-3 py-1">
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            placeholder="Comment to your friends..."
            className="flex-1 w-full px-2 py-1 pr-12 text-[13px] bg-transparent rounded-full focus:outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
            name="postComment"
            autoComplete="off"
          />
          <button
            onClick={handleComment}
            disabled={!desc.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200
              ${
                desc.trim()
                  ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 shadow"
                  : "text-gray-300 cursor-not-allowed bg-gray-200 dark:bg-gray-800"
              }
            `}
            title="Send comment"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
