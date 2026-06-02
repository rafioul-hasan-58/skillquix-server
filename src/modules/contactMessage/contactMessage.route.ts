import { Router } from "express";
import { ContactMessageController } from "./contactMessage.controller";
import { ContactMessageValidation } from "./contactMessage.validation";
import validateRequest from "../../app/middlewares/validateRequest";
import auth from "../../app/middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/send",
  validateRequest(ContactMessageValidation.createContactMessageValidationSchema),
  ContactMessageController.create
);

router.get(
  "/get-all",
  auth(UserRole.ADMIN),
  ContactMessageController.getAll
);

router.get(
  "/get/:id",
  auth(),
  ContactMessageController.getSingle
);

router.patch(
  "/update/:id",
  auth(),
  ContactMessageController.update
);

router.delete(
  "/delete/:id",
  auth(UserRole.ADMIN),
  ContactMessageController.remove
);
router.post(
  "/send-feedback",
  auth(),
  validateRequest(ContactMessageValidation.sendFeedBack),
  ContactMessageController.sendFeedBack
);

export const ContactMessageRoutes = router;
