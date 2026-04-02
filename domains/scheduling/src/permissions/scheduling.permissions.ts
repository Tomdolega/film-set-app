import type { ShootingDayAccessRole } from "../model/shooting-day.js";

export function canReadSchedule(_role: ShootingDayAccessRole): boolean {
  return true;
}

export function canManageSchedule(role: ShootingDayAccessRole): boolean {
  return role === "owner" || role === "admin";
}
