import { EditPost, NewComment, NewPost } from "@/typings";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_ENDPOINT } from "@/axios.config";

export const useEditPostMutation = (postId: number) => {
  const queryclient = useQueryClient();
  return useMutation<EditPost, Error, EditPost>({
    mutationFn: async (newPost: EditPost) => {
      const response = await axios.post<EditPost>(
        `${API_ENDPOINT}/posts/edit/${postId}`,
        {
          desc: newPost.desc,
          imgUrls: newPost.imgUrls,
        },
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryclient.invalidateQueries({ queryKey: ["newPost"] });
    },
    onError: (error: Error) => {
      console.error("Post creation failed:", error);
    },
  });
};

export const useNewPostMutation = () => {
  const queryclient = useQueryClient();
  return useMutation<NewPost, Error, NewPost>({
    mutationFn: (newPost: NewPost) => {
      return axios.post(`${API_ENDPOINT}/posts`, newPost, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryclient.invalidateQueries({ queryKey: ["newPost"] });
    },
  });
};

export const useNewComment = () => {
  const queryclient = useQueryClient();
  return useMutation<NewComment, Error, NewComment>({
    mutationFn: (newComment) => {
      return axios.post(`${API_ENDPOINT}/posts/comments/add`, newComment, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryclient.invalidateQueries({ queryKey: ["newComment"] });
    },
  });
};

type NewReply = any;

export const useNewReply = () => {
  const queryClient = useQueryClient();

  return useMutation<NewReply, Error, NewReply>({
    mutationFn: (newReply) => {
      return axios.post(`${API_ENDPOINT}/posts/comments/reply`, newReply, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newComment"] });
    },
  });
};

export const useGetCommentReplies = (commentId: number) => {
  return useQuery({
    queryKey: ["newComment", commentId],
    queryFn: async () => {
      const response = await axios.get(
        `${API_ENDPOINT}/posts/comments/reply/${commentId}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
