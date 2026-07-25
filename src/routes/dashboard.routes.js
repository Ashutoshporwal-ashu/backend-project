import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getChannelVideos } from "../controllers/dashboard.controller";

const router = Router()

router.use(verifyJWT)

router.route("/videos").get(getChannelVideos)
router.route("/stats").get(getChannelVideos)

export default router