import { z } from "zod";

import { contentCodeSchema } from "./common.js";

export const cohortEnrollSchema = z.object({
  cohortCode: contentCodeSchema,
  batchId: z.string().uuid().nullable(),
});

export const attendanceMarkSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.enum(["present", "absent", "excused"]),
});

export type CohortEnrollInput = z.infer<typeof cohortEnrollSchema>;
export type AttendanceMarkInput = z.infer<typeof attendanceMarkSchema>;
