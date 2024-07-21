import { Router } from "express"
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
const userRouter=Router();
userRouter.route("/register").post(
    upload.fields([
        {
            name:"avtar",
            maxCount:1,
        },
        {
            name:"coverimage",
            maxCount:1,
        }
    ]),

    registerUser)
export default userRouter