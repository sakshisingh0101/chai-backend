import { Router } from "express"
import { changeCurrentPassword, 
    getCurrentUser,
    getUserChannelUpdate,
    getUserWatchHistory,
    loginUser,
    logoutuser,
    refreshAccessToken,
    registerUser,
    updateAccount,
    updateAvtar,
    updatecoverImage } 
    from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const userRouter=Router();
userRouter.route("/register").post(
    upload.fields([
        {
            name:"avtar",
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1,
        }
    ]),

    registerUser)

userRouter.route("/login").post(loginUser)

///secure routes
userRouter.route("/logout").post(verifyJWT,logoutuser)
userRouter.route("/refresh_token").post(refreshAccessToken)
userRouter.route("/change-password").post(verifyJWT,changeCurrentPassword)
userRouter.route("/get-current-user").get(verifyJWT,getCurrentUser)
userRouter.route("/update-account").patch(verifyJWT,updateAccount)
userRouter.route("/update-avtar").patch(verifyJWT,upload.fields("avtar"),updateAvtar)
userRouter.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updatecoverImage)
userRouter.route("/c/:username").get(verifyJWT,getUserChannelUpdate)
userRouter.route("/watch-History").post(verifyJWT,getUserWatchHistory)


export default userRouter