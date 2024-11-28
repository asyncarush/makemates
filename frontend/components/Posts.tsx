import React from "react";
import { fetchUserPosts } from "@/axios.config";
import { useQuery } from "@tanstack/react-query";
import Post from "./Post";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PostInterface } from "@/typings";

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
      {data.reverse().map((post: PostInterface) => {
        const mediaUrls =
          post.post_media && post.post_media.length > 0
            ? post.post_media.map((media: any) => media.media_url)
            : [];

        return (
          <Post
            key={post.id}
            postId={post.id}
            userId={post.user_id}
            profileImage={post.users?.img || null}
            name={post.users?.name || "Unknown User"}
            caption={post.desc}
            mediaUrls={mediaUrls}
            postDate={post.date}
          />
        );
      })}
    </div>
  );
}

export default Posts;
