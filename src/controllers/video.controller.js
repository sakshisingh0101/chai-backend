import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { deleteFile,uploadFile } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";


const videoupload=asyncHandler(async (req,res)=>{
    const {title,description,duration}=req.body;
    if([title,description,duration].some((field)=>(field?.trim()==="")))
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

    const owner=await User.findById(req.user._id).select("-password -refreshTokens")
    const video=await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title:title,
        description:description,
        duration:duration,
        owner:owner,
        isPublished:true,
    })

    // we can return created video by assigning only owner.id to respose through aggregation and pipeline,

    return res
    .status(200)
    .json(new ApiResponse(200,"Successfuly uploaded",video));


})
export {videoupload};