export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}
