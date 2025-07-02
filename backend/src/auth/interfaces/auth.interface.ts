export interface JwtPayload {
  sub: string; // user id - STRING pour compatibilité frontend
  email?: string; // Optionnel pour compatibilité frontend
  name?: string; // Optionnel et undefined au lieu de null
  admin?: boolean; // Optionnel pour compatibilité frontend
  notificationToken?: string; // Token for push notifications
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
  token_type: string;
  expires_in: number;
  user: UserPayload;
}
