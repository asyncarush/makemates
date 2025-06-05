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

      <div className="flex w-full p-2 items-center space-x-4">
        <Image
          src={currentUser.img || "/avatar.png"}
          className="rounded-full bg-gray-100"
          width="30"
          height="30"
          alt="Your profile picture"
        />
        <div className="flex items-center w-full justify-between px-2 rounded-full">
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            placeholder="Comment to your friends..."
            className="text-[12px] w-full bg-transparent px-2 py-1 bg-gray-100 rounded-2xl focus:outline-none text-gray-700 placeholder:text-gray-400"
            name="postComment"
          />
          <button
            onClick={handleComment}
            disabled={!desc.trim()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
          >
            <SendIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
