import express from "express";
import { WebhookController } from "./webhook.controller";

const router = express.Router();

router.post("/stripe", WebhookController.handleStripeWebhook);

export const WebhookRoutes = router;