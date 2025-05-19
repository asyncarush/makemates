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

export interface ChatContextType {
  socket: any; // Socket.io client instance
}

export interface NewComment {
  desc: string;
  postId: number;
}

interface PostProps {
  caption: string;
  name: string;
  mediaUrls: (string | MediaItem)[];
  postDate: string;
  profileImage: string | null;
  postId: number;
  userId: number;
  totalLikes: number;
  totalComments: number;
  cu_like_status: number;
}

interface PostInterface {
  userid: number;
  username: string;
  userprofileimage: string;
  postid: number;
  content: string;
  postdate: string;
  media_urls: string[];
  cu_like_status: number;
  totallikes: number;
  totalcomments: number;
}

interface UploadResponse {
  urls: string[];
  success: boolean;
  message: string;
}

interface EditPostProps {
  caption: string;
  mediaUrls: Array<string | MediaItem>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  userId: number;
  postId: number;
}

export interface NotificationType {
  id: number;
  user_sender_id: number;
  type: string;
  resource_id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    name?: string;
    img?: string;
  };
}
