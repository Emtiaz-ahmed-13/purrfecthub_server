import express from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { AdoptionControllers } from "./adoption.controllers";
import { AdoptionValidations } from "./adoption.validations";

const router = express.Router();

// Adopter routes
router.post(
  "/",
  auth("ADOPTER"),
  validateRequest(AdoptionValidations.submitAdoptionSchema),
  AdoptionControllers.submitAdoption
);

router.get("/my-applications", auth("ADOPTER"), AdoptionControllers.getMyAdoptions);

// Shelter routes
router.get(
  "/shelter/applications",
  auth("SHELTER"),
  AdoptionControllers.getShelterAdoptions
);

router.patch(
  "/:id/status",
  auth("SHELTER"),
  validateRequest(AdoptionValidations.reviewAdoptionSchema),
  AdoptionControllers.reviewAdoption
);

router.patch(
  "/:id/review",
  auth("SHELTER"),
  validateRequest(AdoptionValidations.reviewAdoptionSchema),
  AdoptionControllers.reviewAdoption
);

router.patch(
  "/:id/complete",
  auth("SHELTER"),
  validateRequest(AdoptionValidations.completeAdoptionSchema),
  AdoptionControllers.completeAdoption
);

// Both can view
router.get("/:id", auth("ADOPTER", "SHELTER", "ADMIN"), AdoptionControllers.getAdoptionById);

export const AdoptionRoutes = router;
