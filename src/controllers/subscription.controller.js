import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { User } from "../models/user.models";
import { Video } from "../models/video.models";
import { Subscription } from "../models/subsription.models";
import mongoose from "mongoose";
const toggleSubscription=asyncHandler(async(req,res)=>{
    const {channelId}=req.params;
    const SubscriberUser=await User.findById(req.user._id).select("-password -refreshTokens");
    if(!SubscriberUser)
    {
        throw new ApiError(400,"User not found")
    }
    // const videoId=req.params;
    // const video=Video.findById(videoId);
    // if(!video)
    // {
    //     throw new ApiError(400,"Video not found")
    // }
    // const channelUserId=video.owner;

    const subscribedUser=await Subscription.aggregate([
        {
            $match:{
                subscriber:mongoose.Types.ObjectId(req.user?._id),
                channel:mongoose.Types.ObjectId(channelId)
            }
        }
    ])
    let subscription
    if( subscribedUser.length>0)
    {
       await Subscription.deleteOne({_id:subscribedUser?._id});
    }
    else{
    const channelUser=await User.findById(channelId).select("-password -refreshTokens");
    if(!channelUser)
    {
        throw new ApiError(400,"Channel not found");
    }
     subscription=await Subscription.create({
        subscriber:SubscriberUser._id,
        channel:channelUser._id
    })
}
    return res
    .status(200)
    .json(new ApiResponse(200,"toggle completed successfully",subscription))
    



})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const channelUser=await User.findById(channelId);
    if(!channelUser)
    {
        throw new ApiError(401,"Channel not found ");
    }
    const channelSubscribers=await Subscription.aggregate([
        {
            $match:{
                channel:mongoose.Types.ObjectId(channelUser._id)
            }

        },
        {
            $lookup:{
                from:"User",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriberDetails"
            }

        },
        {
            $project:{
                "subscriberDetails.password": 0,
                "subscriberDetails.refreshTokens": 0
            }
        }

    ])
    if(!channelSubscribers)

    {
            throw new ApiError(500,"Internal server error")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,"Subscribers retrieved successfully",channelSubscribers))
    
    

})
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const subscriberUser=await User.findById(subscriberId)
    if(!subscriberUser)
    {
        throw new ApiError(400,"User not found");

    }
    const subscribedChannel=await Subscription.aggregate([
        {
            $match:{
                subscriber:mongoose.Types.ObjectId(subscriberUser._id)
            }
        },
        {
            $lookup:{
                from:"User",
                localField:"channel",
                foreignField:"_id",
                as:"channelDetails"
            }
        },
        {
            $project:{
                "channelDetails[0].password":0,
                "channelDetails[0].refrehTokens":0,
            }
        }
    ])
    if(!subscribedChannel)
    {
        throw new ApiError(500,"Internal server error")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,"Subscribed channels retrieved successfully",subscribedChannel))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    

}