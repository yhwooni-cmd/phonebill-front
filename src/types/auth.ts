import { User } from './common';

export interface LoginRequest {
  userId: string;
  password: string;
  autoLogin?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  customer_id: string;
  line_number: string;
}

export interface LoginResponseNormalized {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  customerId: string;
  lineNumber: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}