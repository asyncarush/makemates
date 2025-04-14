import { API_ENDPOINT } from "@/axios.config";
import { AuthContext } from "@/app/context/AuthContext";
import { NewComment } from "@/typings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { SendIcon } from "lucide-react";
import Image from "next/image";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import React from "react";

export function Comments({ postId }: { postId: any }) {
  const { currentUser }: any = useContext(AuthContext);
  const [desc, setDesc] = useState("");

  const queryclient = useQueryClient();

  const mutation = useMutation<NewComment, Error, NewComment>({
    mutationFn: (newComment) => {
      return axios.post(`${API_ENDPOINT}/posts/comments/add`, newComment, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryclient.invalidateQueries({ queryKey: ["newComment"] });
    },
  });

  const handleComment = () => {
    if (!desc.trim()) return;
    mutation.mutate({ desc, postId });
    setDesc("");
  };

  const {
    isPending,
    isError,
    data: allComments,
    error,
  }: any = useQuery({
    queryKey: ["newComment"],
    queryFn: fetchPostComments,
  });

  async function fetchPostComments() {
    try {
      const response = await axios.get(
        `${API_ENDPOINT}/posts/comments/${postId}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error: any) {
      toast.error(error.response.data);
    }
  }

  return (
    <div className="">
      <div className="flex flex-col gap-2">
        {allComments &&
          allComments.map((cmnt: any) => {
            console.log(cmnt);
            return (
              <div
                key={cmnt.id}
                className="group pl-4 bg-slate-100 flex items-start space-x-1"
              >
                <div className="flex items-center justify-center">
                  <Image
                    src={cmnt.users.img || "/avatar.png"}
                    className="rounded-full bg-blue-500 flex items-center justify-center border-2 border-gray-200"
                    width="30"
                    height="30"
                    alt={`${cmnt.users.name}'s profile picture`}
                  />
                </div>

                <div className="flex flex-col gap-1 w-full ">
                  <div className="flex gap-1 items-center justify-center w-fit">
                    <p className="font-medium text-[10px] text-gray-900 truncate px-1 py-0.5 bg-slate-200 rounded-full">
                      {cmnt.users.name}
                    </p>
                    <span className="text-[10px] text-gray-500">
                      {cmnt.datetime ? (
                        <TimeAgo timestamp={cmnt.datetime} />
                      ) : (
                        "2m ago"
                      )}
                    </span>
                  </div>
                  <div className="bg-gray-50">
                    <p className="text-xs text-gray-700">{cmnt.desc}</p>
                  </div>

                  {/* need to work on this */}

                  <div className="hidden items-center space-x-4 mt-1 px-4">
                    <div className="opacity-100 group-hover:opacity-100 transition-opacity flex items-center space-x-4">
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        Like
                      </button>
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div className="flex bg-slate-100 items-center space-x-3 pt-3">
        <Image
          src={currentUser.img || "/avatar.png"}
          className="rounded-full bg-gray-100"
          width="30"
          height="30"
          alt="Your profile picture"
        />
        <div className="flex-1 flex items-center justify-between px-2 bg-slate-200 rounded-full">
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            placeholder="Comment to your friends..."
            className="text-[12px] w-full bg-transparent px-2 py-1  rounded-2xl focus:outline-none text-gray-700 placeholder:text-gray-400"
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

const TimeAgo = ({ timestamp }: { timestamp: string | number | Date }) => {
  return (
    <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
  );
};
