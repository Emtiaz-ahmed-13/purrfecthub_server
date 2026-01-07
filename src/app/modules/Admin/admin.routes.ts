import express from "express";
import auth from "../../middleware/auth";
import { AdminControllers } from "./admin.controllers";

const router = express.Router();

router.get("/analytics", auth("ADMIN"), AdminControllers.getAnalytics);

export const AdminRoutes = router;
