export interface User {
  UserID: number;
  Username: string;
  Avatar?: string;
}

export interface Comment {
  CommentID: number;
  PostID: number;
  UserID: number;
  Content: string;
  CreatedAt: string;
  User: User;
}

export interface PostLike {
  LikeID: number;
  PostID: number;
  UserID: number;
  LikedAt: string;
  User: User;
}

export interface PostFile {
  FileID: number;
  FileURL: string;
  FileType: string;
  PostID: number;
}

export interface Post {
  PostID: number;
  UserID: number;
  Content: string;
  CreatedAt: string;
  Tags: string[];
  UniversityID: number;
  CareerID: number;
  University?: { Name: string };
  Career?: { Name: string };
  User: User;
  Comments: Comment[];
  Likes: PostLike[];
  Files: PostFile[];
}

export interface University {
  UniversityID: number;
  Name: string;
}

export interface Career {
  CareerID: number;
  Name: string;
  UniversityID: number;
}

export interface UserProfile {
  UserID: number;
  Username: string;
  Avatar?: string;
  UniversityID?: number;
  CareerID?: number;
}