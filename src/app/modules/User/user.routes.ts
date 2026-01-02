import express from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { UserControllers } from "./user.controllers";
import { UserValidations } from "./user.validations";

const router = express.Router();

// Protected routes - Any authenticated user
router.get("/me", auth(), UserControllers.getMyProfile);

router.patch(
  "/me",
  auth(),
  validateRequest(UserValidations.updateProfileSchema),
  UserControllers.updateMyProfile
);

// Admin only routes
router.get("/", auth("ADMIN"), UserControllers.getAllUsers);

router.get("/:id", auth("ADMIN"), UserControllers.getUserById);

router.patch(
  "/:id/status",
  auth("ADMIN"),
  validateRequest(UserValidations.updateStatusSchema),
  UserControllers.updateUserStatus
);

router.delete("/:id", auth("ADMIN"), UserControllers.deleteUser);

export const UserRoutes = router;
