import assert from "node:assert/strict";
import test from "node:test";

import { mapShootingDayToEvent } from "./map-shooting-day-to-event.js";

test("maps shooting day title directly into calendar event title", () => {
  const event = mapShootingDayToEvent({
    projectName: "Project One",
    shootingDay: {
      id: "day-1",
      projectId: "project-1",
      organizationId: "org-1",
      title: "Day 5 | Stunts",
      date: "2026-07-25",
      location: "Warehouse",
      startTime: "07:00",
      endTime: "13:00",
      notes: "Rigging before first shot",
      status: "draft",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
    callSheet: {
      shootingDayId: "day-1",
      projectId: "project-1",
      organizationId: "org-1",
      date: "2026-07-25",
      location: "Warehouse",
      startTime: "07:00",
      endTime: "13:00",
      callTime: "07:00",
      notes: "Rigging before first shot",
      crew: [],
    },
  });

  assert.equal(event.title, "Day 5 | Stunts");
  assert.match(event.description ?? "", /Project: Project One/);
  assert.doesNotMatch(event.description ?? "", /Warehouse \|/);
});
