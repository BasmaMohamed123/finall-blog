

// types.ts

export interface ErrorDetails {
  message: string;
  code?: number;
}
export interface User {
  id : number;
  name: string;
  slug: string;
  error?: ErrorDetails; 
  
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  created_at_readable: string;
  user: User;
  children?: Comment[];  // Nested replies
  showReplies?: boolean; // For toggling visibility of replies
  showReplyForm?: boolean; 

  comments: Comment[]; // Nested comments if any
  last_comment: null;
  liked?: boolean;
  likes_count :number;
  error?: ErrorDetails; 
}

export interface props {
  isPostOwner: {
    type: Boolean,
    required: true
    
  },
  commentId: {
    type: Number,
    required: true
  },
  commentSlug: {
    type: String,
    required: true
  }
  error?: ErrorDetails; 
}


export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  created_at: string;
  created_at_readable: string;
  updated_at: string;
  updated_at_readable: string;
  image?: string;
  image_thumb: string;
  user: User;
  comments: Comment[];
  last_comment:null ;
  liked?: boolean;
  likes: User[]; 
  likes_count?: number;
  error?: ErrorDetails; 
  comments_count:number;
  excerpt?: string;
  

}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  pages?: number[];
  error?: ErrorDetails;
}
export interface PostsResponse {
  posts: Post[];
  pagination: Pagination;
  error?: ErrorDetails;
}

export interface UploadResponse {
  message: string;
  error?: ErrorDetails;
}
  
export interface FileInputEvent extends Event {
  target: HTMLInputElement;
}
export interface FormDataPost {
  title: string;
  content: string;
  file?: File;
  error?: ErrorDetails;
}
export interface ApiResponse<T> {
  data: T;
  // Add other fields if needed
  error?: ErrorDetails;
}
interface CommentWithLiked extends Comment {
  liked?: boolean;
  error?: ErrorDetails;
}



import { AxiosError } from 'axios';

try {
  // Your Axios request
} catch (error) {
  if (error instanceof AxiosError) {
    // Handle Axios error
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
  } else {
    // Handle non-Axios errors
    console.error('An unknown error occurred:', error);
  }
}
class CustomError extends Error {
  code?: number;
  
  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
    this.name = 'CustomError';
  }
}














