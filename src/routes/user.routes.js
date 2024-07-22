import { Router } from "express"
import { loginUser, logoutuser, registerUser } from "../controllers/user.controller.js";
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

userRouter.route("login".post(loginUser))

///secure routes
userRouter.route("/logout".post(verifyJWT,logoutuser))
export default userRouter