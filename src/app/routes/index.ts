import express from "express";
import { AuthRoutes } from "../../modules/auth/auth.route";
import { UserRoutes } from "../../modules/user/user.routes";
import { ReflextionRoutes } from "../../modules/reflextion/reflextion.routes";
import { GigRoutes } from "../../modules/gig/gig.routes";
import { PlanRoutes } from "../../modules/plan/plan.routes";
import { SubscriptionRouter } from "../../modules/subscription/subscription.routes";
import { SkillRouter } from "../../modules/skill/skill.routes";
import { AccomplishmentRoutes } from "../../modules/accomplishment/accomplishment.routes";
import { MentorRoutes } from "../../modules/mentor/mentor.routes";
import { SessionRoutes } from "../../modules/session/session.routes";
import { ResumeProfileRoutes } from "../../modules/resumeProfile/resumeProfile.routes";
import { FaqRoutes } from "../../modules/faq/faq.route";
import { ContactMessageRoutes } from "../../modules/contactMessage/contactMessage.route";
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
  {
    path: "/subscription",
    route: SubscriptionRouter,
  },
  {
    path: "/skill",
    route: SkillRouter,
  },
  {
    path: "/accomplishment",
    route: AccomplishmentRoutes,
  },
  {
    path: "/mentor",
    route: MentorRoutes,
  },
  {
    path: "/session",
    route: SessionRoutes,
  },
  {
    path: "/resumeProfile",
    route: ResumeProfileRoutes,
  },
  {
    path: "/faq",
    route: FaqRoutes,
  },
  {
    path: "/contactMessage",
    route: ContactMessageRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
