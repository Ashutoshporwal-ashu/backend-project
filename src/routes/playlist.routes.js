import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller";

const router = Router()
router.use(verifyJWT)
router
    .route("/:playlistId")
    .get(getPlaylistById)
    .post(updatePlaylist)
    .delete(deletePlaylist)

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").delete(removeVideoFromPlaylist)

router.route("/user/:userId").get(getUserPlaylists)

export default router