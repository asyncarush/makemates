import { API_ENDPOINT } from "@/axios.config";
import { AuthContext } from "@/app/context/AuthContext";
import { NewComment } from "@/typings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { SendIcon } from "lucide-react";
import Image from "next/image";
import { useContext, useState } from "react";
import toast from "react-hot-toast";

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
    <div className="space-y-4">
      <div className="flex flex-col space-y-6">
        {allComments &&
          allComments.map((cmnt: any) => {
            return (
              <div key={cmnt.id} className="group flex items-start space-x-3">
                <Image
                  src={cmnt.users.profilePic || "/avatar.png"}
                  className="rounded-full bg-gray-100"
                  width="40"
                  height="40"
                  alt={`${cmnt.users.name}'s profile picture`}
                />
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-2xl px-4 py-3">
                    <p className="font-medium text-[15px] text-gray-900 mb-1">
                      {cmnt.users.name}
                    </p>
                    <p className="text-[15px] text-gray-700">{cmnt.desc}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 px-4">
                    <span className="text-sm text-gray-500">2m ago</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-4">
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

      <div className="flex items-start space-x-3 pt-3">
        <Image
          src={currentUser.profilePic || "/avatar.png"}
          className="rounded-full bg-gray-100"
          width="40"
          height="40"
          alt="Your profile picture"
        />
        <div className="flex-1 flex items-center">
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            placeholder="Write a comment..."
            className="flex-1 text-[15px] px-4 py-3 bg-gray-50 rounded-2xl focus:outline-none text-gray-700 placeholder:text-gray-400"
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
