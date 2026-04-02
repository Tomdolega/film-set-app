export type ContactAccessRole = "owner" | "admin" | "member";

export function canReadContacts(_role: ContactAccessRole): boolean {
  return true;
}

export function canManageContacts(role: ContactAccessRole): boolean {
  return role === "owner" || role === "admin";
}
