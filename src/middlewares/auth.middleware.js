import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
export const verifyJWT=asyncHandler(async(_,req,next)=>{
   try {
    const accessToken= req.cookies?.accessToken||req.headers("Authoriztion").replace("Bearer ","");
    if(!accessToken)
    {
     throw new ApiError(500,"Authentication Token Error")
    }
    const decodedData=jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    const user=await User.findById(decodedData?._id).select("-password -refreshTokens");
    if(!user)
    {// todo: frontend discussion
     throw new ApiError(401,"Invalid access token")
    }
   req.user=user;
   next();
   } catch (error) {
    throw new ApiError(401,`inavlid access :: ${error}`)
   }
})