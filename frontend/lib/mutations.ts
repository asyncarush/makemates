import { EditPost, NewComment, NewPost } from "@/typings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
