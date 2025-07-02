export interface JwtPayload {
  sub: string; // user id - STRING pour compatibilité frontend
  email?: string; // Optionnel pour compatibilité frontend
  name?: string; // Optionnel et undefined au lieu de null
  admin?: boolean; // Optionnel pour compatibilité frontend
  notificationToken?: string; // Token for push notifications
  type: 'access' | 'refresh'; // Token type
  iat?: number;
  exp?: number;
}

export interface UserPayload {
  id: string; // STRING pour compatibilité frontend
  email?: string; // Optionnel pour compatibilité frontend
  name?: string; // Optionnel et undefined au lieu de null
  admin?: boolean; // Optionnel pour compatibilité frontend
  notificationToken?: string; // Token for push notifications
}

export interface AuthResult {
  access_token: string;
  refresh_token: string; // Add refresh token
  token_type: string;
  expires_in: number;
  refresh_expires_in: number; // Refresh token expiration
  user: UserPayload;
}
