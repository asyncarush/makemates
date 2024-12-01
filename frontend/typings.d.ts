export interface SignUpInputType {
  name: string;
  email: string;
  password: string;
  gender: string;
  day: string;
  month: string;
  year: string;
}

export interface NewPost {
  desc: string;
  imgUrls: string;
}

export interface EditPost {
  desc: string;
  imgUrls: string;
  postId: number;
}

export interface LoginInputType {
  email: string;
  password: string;
}

export interface AuthContextType {
  currentUser: any;
  setCurrentUser: Dispatch<any>;
  userSignUp: (inputs: SignUpInputType) => void;
  userLogin: (inputs: LoginInputType) => void; // Correct type
  userLogout: () => void;
}

export interface NewComment {
  desc: string;
  postId: number;
}

interface PostProps {
  caption: string;
  name: string;
  mediaUrls: string[] | string;  // Can be either a string (JSON) or array of strings
  postDate: string;
  profileImage: string | null;
  postId: number;
  userId: number;
}

export interface PostInterface {
  id: number;
  user_id: number;
  users?: {
    img?: string;
    name?: string;
  };
  desc: string;
  post_media?: Array<{
    media_url: string;
  }>;
  date: string;
}

interface UploadResponse {
  urls: string[];
  success: boolean;
  message: string;
}

interface EditPostProps {
  caption: string;
  mediaUrls: string[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  userId: number;
  postId: number;
}
