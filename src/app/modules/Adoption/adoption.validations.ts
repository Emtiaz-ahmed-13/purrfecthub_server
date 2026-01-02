import { z } from "zod";

const submitAdoptionSchema = z.object({
  catId: z.string().uuid("Invalid cat ID"),
  message: z.string().min(10, "Please provide a message about why you want to adopt"),
  homeType: z.string().optional(),
  hasOtherPets: z.boolean().optional(),
  otherPetsInfo: z.string().optional(),
  experience: z.string().optional(),
});

const reviewAdoptionSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED"]),
  reviewNotes: z.string().optional(),
});

const completeAdoptionSchema = z.object({
  status: z.enum(["COMPLETED", "CANCELLED"]),
});

export const AdoptionValidations = {
  submitAdoptionSchema,
  reviewAdoptionSchema,
  completeAdoptionSchema,
};
