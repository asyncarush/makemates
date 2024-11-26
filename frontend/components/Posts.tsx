import React from "react";
import { fetchUserPosts } from "@/axios.config";
import { useQuery } from "@tanstack/react-query";
import Post from "./Post";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function Posts({ userId }: { userId: number }) {
  const { isPending, isError, data, error }: any = useQuery({
    queryKey: ["newPost"],
    queryFn: () => fetchUserPosts(userId),
  });

  const router = useRouter();

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    if (error.response.status == 301) {
      toast.error("Session Expired ! Logged In Now");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
    return <span>Error: {error.message}</span>;
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {data.reverse().map((post: any) => {
        return (
          <Post
            key={post.id}
            postId={post.id}
            userId={post.user_id}
            profileImage={post.users.img}
            name={post.users.name}
            caption={post.desc}
            mediaUrl={post.post_media[0].media_url}
            postDate={post.date}
          />
        );
      })}
    </div>
  );
}

export default Posts;
