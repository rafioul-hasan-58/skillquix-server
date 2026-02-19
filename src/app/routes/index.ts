import express from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.routes";
import { ResumeRouter } from "../modules/resume/resume.routes";
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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
