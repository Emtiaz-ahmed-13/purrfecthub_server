import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  role: z.enum(["ADOPTER", "SHELTER", "ADMIN"]).optional().default("ADOPTER"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  homeType: z.string().optional(),
  hasOtherPets: z.boolean().optional(),
  otherPetsInfo: z.string().optional(),
  experience: z.string().optional(),
  aboutMe: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "BANNED"]),
});

export const UserValidations = {
  registerSchema,
  updateProfileSchema,
  updateStatusSchema,
};
