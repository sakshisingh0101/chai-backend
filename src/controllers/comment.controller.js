import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { User } from "../models/user.models.js"
import { Video } from "../models/video.models.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const video=await Video.findById(videoId);
    if(!video)
    {
        throw new ApiError(400,"Video not found");
    }
    const getAllComments=await Comment.aggregate([
        {
            $match:{
                video:mongoose.Types.ObjectId(video?._id)
            }

        },
        {
            $skip:(page-1)*limit,

            
        },
        {
            $limit:limit,
        }

    ])
    return res
    .status(200)
    .json(new ApiResponse(200,"Successfully fetched comments",getAllComments));

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content}=req.body;
    if(content.trim()==="")
    {
        throw new ApiError("400","Comment is required")
    }
    const {videoId}=req.params
    const user=await User.findById(req.user?._id);
    if(!user)
    {
        throw new ApiError(400,"User not found ")
    }
    const video=await Video.findById(videoId);
    if(!video)
    {
        throw new ApiError(400,"Video not found");
    }
    const comment=await Comment.create({
        content:content,
        video:video._id,
        owner:user._id
    })
    return res
    .status(200)
    .json(new ApiResponse(200,"Comment added successfully",comment))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.params
    const {updatedcontent}=req.body
    if(updatedcontent.trim()==="")
    {
        throw new ApiError(400,"Comment is required")
    }
    const updateComment=await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content:updatedcontent
        }
    },{new :true});

    return res
    .status(200)
    .json(new ApiResponse(200,"Successfully updated",updateComment))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params;
    const deletecomment=await Comment.deleteOne(commentId);
    return res
    .status(200)
    .json(new ApiResponse(200,"Successfully deleted",deletecomment))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }