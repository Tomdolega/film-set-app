export function canReadEquipment(_role: "owner" | "admin" | "member"): boolean {
  return true;
}

export function canManageEquipment(role: "owner" | "admin" | "member"): boolean {
  return role === "owner" || role === "admin";
}
