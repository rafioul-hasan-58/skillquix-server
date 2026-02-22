import express from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.routes";
import { ResumeRouter } from "../modules/resume/resume.routes";
import { ReflextionRoutes } from "../modules/reflextion/reflextion.routes";
import { GigRoutes } from "../modules/gig/git.routes";
import { PlanRoutes } from "../modules/plan/plan.routes";
const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/resume",
    route: ResumeRouter,
  },
  {
    path: "/reflextion",
    route: ReflextionRoutes,
  },
  {
    path: "/gig",
    route: GigRoutes,
  },
  {
    path: "/plan",
    route: PlanRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
