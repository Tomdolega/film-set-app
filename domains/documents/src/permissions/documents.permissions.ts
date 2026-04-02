export type DocumentAccessRole = "owner" | "admin" | "member";

export function canReadDocuments(_role: DocumentAccessRole): boolean {
  return true;
}

export function canManageDocuments(_role: DocumentAccessRole): boolean {
  return true;
}
