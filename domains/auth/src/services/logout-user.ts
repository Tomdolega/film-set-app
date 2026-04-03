import type { SessionsRepository } from "../repositories/sessions.repository.js";

export interface LogoutUserParams {
  sessionId: string | null | undefined;
  sessionsRepository: SessionsRepository;
}

export async function logoutUser(params: LogoutUserParams): Promise<void> {
  if (!params.sessionId) {
    return;
  }

  await params.sessionsRepository.deleteSession(params.sessionId);
}
