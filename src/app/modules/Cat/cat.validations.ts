import { z } from "zod";

const createCatSchema = z.object({
  name: z.string().min(1, "Name is required"),
  breed: z.string().min(1, "Breed is required"),
  age: z.number().int().min(0, "Age must be a positive number"),
  gender: z.enum(["MALE", "FEMALE"]),
  color: z.string().min(1, "Color is required"),
  weight: z.number().positive().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  isVaccinated: z.boolean().optional(),
  isNeutered: z.boolean().optional(),
  specialNeeds: z.string().optional(),
});

const updateCatSchema = z.object({
  name: z.string().min(1).optional(),
  breed: z.string().min(1).optional(),
  age: z.number().int().min(0).optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  color: z.string().min(1).optional(),
  weight: z.number().positive().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum(["AVAILABLE", "PENDING", "ADOPTED", "NOT_AVAILABLE"]).optional(),
  isVaccinated: z.boolean().optional(),
  isNeutered: z.boolean().optional(),
  specialNeeds: z.string().optional(),
});

export const CatValidations = {
  createCatSchema,
  updateCatSchema,
};
