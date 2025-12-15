import { type UUID } from 'node:crypto';

export class UserSession {
  userId!: number;
  sessionId!: UUID;
  loginAt?: string;
}
