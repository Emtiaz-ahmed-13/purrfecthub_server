import express from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { UserControllers } from "../User/user.controllers";
import { UserValidations } from "../User/user.validations";
import { AuthControllers } from "./auth.controllers";

const router = express.Router();

// Public routes
router.post(
  "/register",
  validateRequest(UserValidations.registerSchema),
  UserControllers.register
);
router.post("/login", AuthControllers.login);
router.post("/refresh-token", AuthControllers.refreshToken);

// Protected routes
router.post("/change-password", auth(), AuthControllers.changePassword);

export const AuthRoutes = router;

