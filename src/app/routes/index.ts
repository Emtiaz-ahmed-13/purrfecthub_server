import express from "express";
import { AdminRoutes } from "../modules/Admin/admin.routes";
import { AdoptionRoutes } from "../modules/Adoption/adoption.routes";
import { AIChatRoutes } from "../modules/AIChat/ai.routes";
import { AITrainingRoutes } from '../modules/AITraining/ai-training.routes';
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { CatRoutes } from "../modules/Cat/cat.routes";
import { ChatRoutes } from "../modules/Chat/chat.routes";
import { DonationRoutes } from "../modules/Donation/donation.routes";
import { MedicalRoutes } from "../modules/Medical/medical.routes";
import { ShelterRoutes } from "../modules/Shelter/shelter.routes";
import { UserRoutes } from "../modules/User/user.routes";

const router = express.Router();

router.get("/", (req: express.Request, res: express.Response) => {
  res.send({
    success: true,
    message: "Welcome to PurrfectHub API v1",
    data: null,
  });
});

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/shelters",
    route: ShelterRoutes,
  },
  {
    path: "/cats",
    route: CatRoutes,
  },
  {
    path: "/adoptions",
    route: AdoptionRoutes,
  },
  {
    path: "/medical",
    route: MedicalRoutes,
  },
  {
    path: "/donations",
    route: DonationRoutes,
  },
  {
    path: "/chat",
    route: ChatRoutes,
  },
  {
    path: "/ai",
    route: AIChatRoutes,
  },
  {
    path: '/ai-training',
    route: AITrainingRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
