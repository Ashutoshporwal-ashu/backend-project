import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()
router.use(verifyJWT)

router.route("/").get(healthcheck)

export default router