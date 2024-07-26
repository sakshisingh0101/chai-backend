import { Router } from "express"
import { upload } from "../middlewares/multer.js";
import { videoupload } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const videoRouter=Router();

videoRouter.route("/video-upload").post(verifyJWT,upload.fields([
    {
        name:"videoFile",
        maxCount:1,
    },
    {
        name:"thumbnail",
        maxCount:1,
    }
]),videoupload)
export {videoRouter}