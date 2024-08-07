import mongoose from "mongoose";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { User } from "../models/user.models";
import { Like } from "../models/likes.models";
import { asyncHandler } from "../utils/asyncHandler";
import { Video } from "../models/video.models";
import { Tweet } from "../models/tweets.models";
import { Comment } from "../models/comment.models";

const toggleVideoLike=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const user=await User.findById(req.user?._id);
    if(!user)
    {
        throw new ApiError(400,"User not found");

    }
    const video=await Video.findById(videoId);
    if(!video)
    {
        throw new ApiError(400,"Video not found");
    }
    const alreadyLikedUser=await Like.aggregate([
        {
            $match:{
                LikedBy:mongoose.Types.ObjectId(req.user?._id),
                video:mongoose.Types.ObjectId(videoId)
            }

        },
      
    ]) 
    let likeUser;
    if(alreadyLikedUser.length>0)
        
    {
         likeUser=await Like.deleteOne(alreadyLikedUser._id);
    }
    

    else{
   const  likeUser=await Like.create({
        video:video._id,
        LikedBy:user._id,

    })

  return res
  .status(200)
  .json(new ApiResponse(200,"Successfully toggled video",likeUser))
}

})

const toggleTweetLike=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;
    const user=await User.findById(req.user?._id);
    if(!user)
    {
        throw new ApiError(400,"User not found");

    }
    const tweet=await Tweet.findById(tweetId);
    if(!tweet)
    {
        throw new ApiError(400,"Tweet not found");
    }
    const alreadyLikedUser=await Like.aggregate([
        {
            $match:{
                LikedBy:mongoose.Types.ObjectId(req.user?._id),
                tweet:mongoose.Types.ObjectId(tweetId)
            }
        }
    ]) 
    let likeUser;
    if(alreadyLikedUser.length>0)
        
    {
         likeUser=await Like.deleteOne(alreadyLikedUser._id)
    }

    else{
     likeUser=await Like.create({
        tweet:tweet._id,
        LikedBy:user._id,

    })
    }

  return res
  .status(200)
  .json(new ApiResponse(200,"Successfully toggled tweet",likeUser))

})
const toggleCommentLike=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    const user=await User.findById(req.user?._id);
    if(!user)
    {
        throw new ApiError(400,"User not found");

    }
    const comment=await Comment.findById(commentId);
    if(!comment)
    {
        throw new ApiError(400,"Comment not found");
    }
    const alreadyLikedUser=await Like.aggregate([
        {
            $match:{
                LikedBy:mongoose.Types.ObjectId(req.user?._id),
                comment:mongoose.Types.ObjectId(commentId)
            }
        }
    ]) 
    let likeUser;
    if(alreadyLikedUser.length>0)
        
    {
         likeUser=await Like.deleteOne(alreadyLikedUser._id)
    }

    else{
     likeUser=await Like.create({
        comment:comment._id,
        LikedBy:user._id,

    })
    }

  return res
  .status(200)
  .json(new ApiResponse(200,"Successfully toggled comment",likeUser))

})
export {
    toggleVideoLike,
    toggleTweetLike,

}