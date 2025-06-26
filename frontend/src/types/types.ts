export interface User {
  UserID: number;
  Email: string;
  Username: string;
  Avatar?: string;
  Role: string;
  UniversityID?: number;
  CareerID?: number;
  University?: University;
  Career?: Career;
  CreatedAt: string;
  Posts: number;
  Likes: number;
}

export interface Tag {
  TagID: number;
  Name: string;
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
  FileName: string;
  PostID: number;
}

export interface Post {
  PostID: number;
  UserID: number;
  Content: string;
  CreatedAt: string;
  Tags: Tag[];
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

export interface Channel {
  ChannelID: number;
  Name: string;
  Description: string;
  IsPrivate: boolean;
  CreatedAt: string;
  CreatedBy: number;
  UniversityID: number;
  CareerID: number;
  Creator?: User;
  University?: University;
  Career?: Career;
  Members?: ChannelMember[];
}

export interface ChannelMember {
  MemberID: number;
  ChannelID: number;
  UserID: number;
  IsAdmin: boolean;
  JoinedAt: string;
  LastSeenAt: string;
  User?: User;
}

export interface ChannelInvitation {
  InvitationID: number;
  ChannelID: number;
  InvitedBy: number;
  InvitedUser: number;
  Status: "pending" | "accepted" | "rejected";
  CreatedAt: string;
  UpdatedAt: string;
  Channel?: Channel;
  Inviter?: User;
}

export interface ChannelPost {
  PostID: number;
  ChannelID: number;
  UserID: number;
  Content: string;
  CreatedAt: string;
  UpdatedAt: string;
  Tags: string[];
  User?: User;
  Files?: ChannelPostFile[];
  Comments?: ChannelPostComment[];
  Likes?: ChannelPostLike[];
}

export interface ChannelPostFile {
  FileID: number;
  PostID: number;
  FileURL: string;
  FileType: string;
  FileName: string;
}

export interface ChannelPostComment {
  CommentID: number;
  PostID: number;
  UserID: number;
  Content: string;
  CreatedAt: string;
  UpdatedAt: string;
  User?: User;
}

export interface ChannelPostLike {
  LikeID: number;
  PostID: number;
  UserID: number;
}
