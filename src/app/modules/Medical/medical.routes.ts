import express from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { MedicalControllers } from "./medical.controllers";
import { MedicalValidations } from "./medical.validations";

const router = express.Router();

// Shelter routes
router.post(
  "/cats/:catId/records",
  auth("SHELTER"),
  validateRequest(MedicalValidations.createMedicalRecordSchema),
  MedicalControllers.createMedicalRecord
);

router.get("/reminders", auth("SHELTER"), MedicalControllers.getUpcomingReminders);

router.patch(
  "/records/:id",
  auth("SHELTER"),
  validateRequest(MedicalValidations.updateMedicalRecordSchema),
  MedicalControllers.updateMedicalRecord
);

router.delete("/records/:id", auth("SHELTER"), MedicalControllers.deleteMedicalRecord);

// Authenticated users can view
router.get("/cats/:catId/records", auth(), MedicalControllers.getCatMedicalRecords);
router.get("/records/:id", auth(), MedicalControllers.getMedicalRecordById);

export const MedicalRoutes = router;
