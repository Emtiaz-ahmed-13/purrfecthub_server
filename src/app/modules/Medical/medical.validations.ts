import { z } from "zod";

const createMedicalRecordSchema = z.object({
  type: z.enum(["VACCINATION", "VET_VISIT", "HEALTH_CHECK", "TREATMENT", "SURGERY"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  veterinarian: z.string().optional(),
  clinic: z.string().optional(),
  date: z.string().datetime().or(z.string()),
  nextDueDate: z.string().datetime().or(z.string()).optional(),
  documents: z.array(z.string().url()).optional(),
  cost: z.number().positive().optional(),
});

const updateMedicalRecordSchema = z.object({
  type: z.enum(["VACCINATION", "VET_VISIT", "HEALTH_CHECK", "TREATMENT", "SURGERY"]).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  veterinarian: z.string().optional(),
  clinic: z.string().optional(),
  date: z.string().datetime().or(z.string()).optional(),
  nextDueDate: z.string().datetime().or(z.string()).optional().nullable(),
  documents: z.array(z.string().url()).optional(),
  cost: z.number().positive().optional(),
});

export const MedicalValidations = {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
};
