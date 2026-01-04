import express from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { ShelterControllers } from "./shelter.controllers";
import { ShelterValidations } from "./shelter.validations";

const router = express.Router();

// Public routes
router.get("/", ShelterControllers.getAllShelters);
router.get("/nearby", ShelterControllers.getNearbyShelters);
router.get("/me", auth("SHELTER"), ShelterControllers.getMyShelterProfile);
router.get("/:id", ShelterControllers.getShelterById);

// Shelter only routes
router.post(
  "/profile",
  auth("SHELTER"),
  validateRequest(ShelterValidations.createShelterSchema),
  ShelterControllers.createShelterProfile
);

router.post(
  "/",
  auth("SHELTER"),
  validateRequest(ShelterValidations.createShelterSchema),
  ShelterControllers.createShelterProfile
);

router.get("/profile/me", auth("SHELTER"), ShelterControllers.getMyShelterProfile);

router.patch(
  "/profile",
  auth("SHELTER"),
  validateRequest(ShelterValidations.updateShelterSchema),
  ShelterControllers.updateShelterProfile
);

router.patch("/profile/location", auth("SHELTER"), ShelterControllers.updateLocation);

// Admin only routes
router.patch("/:id/verify", auth("ADMIN"), ShelterControllers.verifyShelter);

export const ShelterRoutes = router;
