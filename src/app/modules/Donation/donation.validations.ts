import { z } from "zod";

const createDonationSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  message: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  shelterId: z.string().uuid().optional(),
  catId: z.string().uuid().optional(),
}).refine((data) => data.shelterId || data.catId, {
  message: "Either shelterId or catId must be provided",
});

export const DonationValidations = {
  createDonationSchema,
};
