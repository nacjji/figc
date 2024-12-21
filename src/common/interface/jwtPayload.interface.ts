export interface JwtPayload {
  userId: number;
  name: string;
  email: string;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}
