import * as Stripe from "stripe";
import config from "../../config";

const stripe = new (Stripe as any)(config.stripe.secret_key as string, {
    apiVersion: "2025-12-15.clover",
});

export default stripe;