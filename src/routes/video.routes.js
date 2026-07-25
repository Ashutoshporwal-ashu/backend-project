import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import router from "./tweets.routes";
import {deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo} from "../controllers/video.controller"
import { upload } from "../middlewares/multer.middleware";

const videoRouter = Router()

router.route(verifyJWT)

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        publishAVideo
    )

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail") ,updateVideo)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus)


export default videoRouter