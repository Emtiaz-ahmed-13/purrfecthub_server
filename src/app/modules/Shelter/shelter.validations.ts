import { z } from "zod";

const createShelterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

const updateShelterSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
});

export const ShelterValidations = {
  createShelterSchema,
  updateShelterSchema,
};
