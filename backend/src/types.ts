export interface Note {
  id: number;
  text: string;
  created_at: string;
}

export interface PublicUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}
