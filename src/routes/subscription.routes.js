import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller";

const router = Router()

router.use(verifyJWT)

router
    .route("/c1/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription)

router.route("/u/:subscriberId").get(getSubscribedChannels)

export default router