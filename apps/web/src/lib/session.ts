export interface WebSession {
  id: string;
  email: string;
  name: string;
}

const DEFAULT_MOCK_USER_ID = "11111111-1111-1111-1111-111111111111";
const DEFAULT_MOCK_USER_EMAIL = "owner@example.com";
const DEFAULT_MOCK_USER_NAME = "Mock Owner";

export function getMockSession(): WebSession {
  return {
    id: process.env.MOCK_USER_ID ?? DEFAULT_MOCK_USER_ID,
    email: process.env.MOCK_USER_EMAIL ?? DEFAULT_MOCK_USER_EMAIL,
    name: process.env.MOCK_USER_NAME ?? DEFAULT_MOCK_USER_NAME,
  };
}

