import type { SessionWithUser, SessionsRepository } from "../repositories/sessions.repository.js";

export interface GetSessionParams {
  sessionId: string | null | undefined;
  sessionsRepository: SessionsRepository;
  now?: Date;
}

export async function getSession(params: GetSessionParams): Promise<SessionWithUser | null> {
  if (!params.sessionId) {
    return null;
  }

  const sessionWithUser = await params.sessionsRepository.findSessionWithUserById(params.sessionId);

  if (!sessionWithUser) {
    return null;
  }

  const now = params.now ?? new Date();

  if (sessionWithUser.session.expiresAt.getTime() <= now.getTime()) {
    await params.sessionsRepository.deleteSession(params.sessionId);
    return null;
  }

  return sessionWithUser;
}
