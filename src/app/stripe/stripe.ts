import Stripe from "stripe";
import config from "../../config";

const stripe = new Stripe(config.stripe.secret_key as string);

export default stripe;