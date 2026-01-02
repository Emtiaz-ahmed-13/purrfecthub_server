import express from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { DonationControllers } from "./donation.controllers";
import { DonationValidations } from "./donation.validations";

const router = express.Router();

// Create donation (authenticated or guest)
router.post(
  "/",
  auth(), // Can be authenticated
  validateRequest(DonationValidations.createDonationSchema),
  DonationControllers.createDonation
);

// Simulate payment (for development)
router.post("/verify-payment", DonationControllers.verifyPayment);

// My donations
router.get("/my-donations", auth(), DonationControllers.getMyDonations);

// Shelter donations
router.get("/shelter-donations", auth("SHELTER"), DonationControllers.getShelterDonations);

// Admin stats
router.get("/stats", auth("ADMIN"), DonationControllers.getDonationStats);

export const DonationRoutes = router;
