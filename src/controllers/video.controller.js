import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { deleteFile,uploadFile } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";


const videoupload=asyncHandler(async (req,res)=>{
    const {title,description}=req.body;
    if([title,description].some((field)=>(field?.trim()==="")))
    {
        throw new ApiError(401,"title,description and duration are required");
    }
    let videoLocalPath;
    if(req.files&&req.files.videoFile.length>0)
    {
        videoLocalPath=req.files?.videoFile[0]?.path;
    }
    if(!videoLocalPath)
    {
        throw new ApiError(400,"video file is compulsory")
    }
    let thumbnailLocalPath;
    if(req.files&&req.files.thumbnail.length>0)
    {
        thumbnailLocalPath=req.files?.thumbnail[0]?.path;
    }
    if(!thumbnailLocalPath)
   {
      throw new ApiError(400,"thumbnail is required");
   }
    const videoFile=await uploadFile(videoLocalPath);
    const thumbnail=await uploadFile(thumbnailLocalPath);
    if(!videoFile)
    {
        throw new ApiError(500,"Internal server failed :: Uplaod failed")
    }
    if(!thumbnail)
    {
        throw new ApiError(500,"Internal server error:: upload failed")
    }

    const owner=await User.findById(req.user._id).select("-password -refreshTokens ")
    const video=await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title:title,
        description:description,
        duration:videoFile.duration,
        owner:owner._id,
        isPublished:true,
      
    })

    // we can return created video by assigning only owner.id to respose through aggregation and pipeline,

    return res
    .status(200)
    .json(new ApiResponse(200,"Successfuly uploaded",video));


})

const getVideoById=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const videoResponse=await Video.findById(videoId);
    if(!videoResponse)
    {
        throw new ApiError(500,"Video doesn't exist");
    }
    return res
    .status(200)
    .json(new ApiResponse(200,"Successfully fetched video by the given id",videoResponse));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const {title,description}=req.body;
    if(!title||!description)
    {  
        throw new ApiError(400,"Title and description both are required")

    }

    const thumbnailLocalPath=req.file?.thumbnail;
    if(!thumbnailLocalPath)
    {
        throw new ApiError(400,"Thumbnail is required")
    }

    const thumbnail=await uploadFile(thumbnailLocalPath);

    const videoObject=await Video.findById(videoId)
    const oldthumbnailurl=videoObject.thumbnail.split("/");
    const thumbnailExtnesion=oldthumbnailurl[oldthumbnailurl.length-1];
    const thumbnail_id=thumbnailExtnesion.split(".")[0];

    const deleteThumbnail=await deleteFile(thumbnail_id);
    if(!deleteThumbnail.result==="ok")
    {
        throw new ApiError
    }
    
    if(!thumbnail)
    {
        throw new ApiError(500,"Internal Server Error:: Upload Failed")
    }

    const video=await Video.findByIdAndUpdate(videoId,{
        $set:{
            title:title,
            description:description,
            thumbnail:thumbnail.url,
        }
    },{new:true,})

    return res
    .status
    .json(new ApiResponse(200,"Updated Successfully",video));


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId)
    {
        throw ApiError(400,"Video id not found")
    }
    const video=await Video.findById(videoId)
    if(!video)
    {
        throw ApiError(401,"Video not found ")
    }

    const oldthumbnailurl=video.thumbnail.split("/");
    const thumbnailExtnesion=oldthumbnailurl[oldthumbnailurl.length-1];
    const thumbnail_id=thumbnailExtnesion.split(".")[0];

    const deleteThumbnail=await deleteFile(thumbnail_id);
    if(!deleteThumbnail.result==="ok")
    {
        throw new ApiError(500,"Intenral server error ::  ")
    }

    const oldvideoFileurl=videoObject.videoFile.split("/");
    const videoFileExtension=oldvideoFileurl[oldvideoFileurl.length-1];
    const videoFile_id=videoFileExtension.split(".")[0];

    const deleteVideoFile=await deleteFile(videoFile_id);
    if(!deleteVideoFile.result==="ok")
    {
        throw new ApiError(500,"Internal server error :: deletion error")
    }

   const deleteVideo=await Video.deleteOne({_id:videoId});
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video=await Video.findByIdAndUpdate(videoId,{
        $set:{
            isPublished:{
                $not:"$isPublished"
            }
        }
    },{new:true})
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pageNumber=Number(page);
    const limitSet=Number(limit)
  
    const videos=await Video.aggregate([
        {
            $match:{
                owner:mongoose.Types.ObjectId(userId),
            }
        },
        {
             $sort:{
                [sortBy]:sortType==="asc"?1:-1
             }
        },
        {
            $skip:(pageNumber-1)*limitSet,
            

        },
        {
            $limit:limitSet,
        }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200,"All the videos retrieved",videos))
})


export {
    videoupload,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos,
};