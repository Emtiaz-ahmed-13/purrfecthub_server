import express from "express";
import { AdoptionRoutes } from "../modules/Adoption/adoption.routes";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { CatRoutes } from "../modules/Cat/cat.routes";
import { ChatRoutes } from "../modules/Chat/chat.routes";
import { DonationRoutes } from "../modules/Donation/donation.routes";
import { MedicalRoutes } from "../modules/Medical/medical.routes";
import { ShelterRoutes } from "../modules/Shelter/shelter.routes";
import { UserRoutes } from "../modules/User/user.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
