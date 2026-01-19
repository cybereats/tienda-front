import { User } from './user.model'

export interface RegisterRequest {
  name: string
  username: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: User
}

export interface UserProfile {
  id: number;
  name: string;
  surname: string;
  email: string;
  bornDate: string;
  username: string;
  role: string;
}
