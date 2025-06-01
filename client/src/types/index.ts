export interface User {
  id: number;
  name: string;
  phone?: string;
  discord_id?: string;
  age?: number;
  bio?: string;
  reason?: string;
  clan_id?: number;
  avatar?: string;
  role: "admin" | "clan_owner" | "member";
  status: "pending" | "accepted" | "rejected";
  score: number;
  created_at: Date;
}

export interface Clan {
  id: number;
  name: string;
  description?: string;
  banner?: string;
  owner_id?: number;
  memberCount?: number;
  created_at: Date;
}

export interface JoinRequest {
  id: number;
  user_id: number;
  clan_id: number;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  created_at: Date;
  user?: User;
}

export interface Announcement {
  id: number;
  clan_id?: number;
  author_id?: number;
  title?: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  created_at: Date;
  author?: User;
}

export interface AuthUser {
  loggedIn: boolean;
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}
