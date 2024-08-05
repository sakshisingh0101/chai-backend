import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { User } from "../models/user.models";
import { Tweet } from "../models/tweets.models";
import mongoose, { mongo } from "mongoose";
const createTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body
    if(content.trim()==="")
    {
        throw new ApiError(400,"Content is required");
    }

    const user=await User.findById(req.user?._id);
    if(!user)
    {
        throw new ApiError(400,"User not found");
    }
    const tweet=await Tweet.create({
        content:content,
        owner:user._id
    })
    return res
    .status(200)
    .json(new ApiResponse(200,"Tweet created successfully",tweet));
})
const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const {userId}=req.params;
    const user=await User.findById(userId)
    if(!user)
    {
        throw new ApiError(400,"User not found")
    }
    const userTweets=await Tweet.aggregate([
        {
            $match:{
                owner:mongoose.Types.ObjectId(userId)
            }
        }
    ])
    return res
    .status(200)
    .json(200,"Tweets fetched successfully",userTweets)
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {updatedContent}=req.body

    if(updatedContent.trim()==="")
    {
        throw new ApiError(200,"Content is required")
    }

    const {tweetId}=req.params
    const updatedTweet=await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content:updatedContent
        }
    },{new :true})
    return res
    .status(200)
    .json(new ApiResponse(200,"updated successfully",updatedTweet))



})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params
    const user=await User.findById(req.user?._id);
    if(!user)
    {
        throw new ApiError(400,"User not found")
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    await Tweet.deleteOne({_id:tweetId})
    return res
    .status(200)
    .json(new ApiResponse(200,"Deleted Successfully",{}))
})
export {
    createTweet,
    updateTweet,
    getUserTweets,
    deleteTweet

}
