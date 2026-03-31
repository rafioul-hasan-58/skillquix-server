import { Router } from "express";
import { ContactMessageController } from "./contactMessage.controller";
import { ContactMessageValidation } from "./contactMessage.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
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
  validateRequest(ContactMessageValidation.updateContactMessageValidationSchema),
  ContactMessageController.update
);

router.delete(
  "/delete/:id",
  auth(UserRole.ADMIN),
  ContactMessageController.remove
);

export const ContactMessageRoutes = router;
