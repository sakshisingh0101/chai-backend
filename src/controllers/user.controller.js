import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadFile } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import  jwt from "jsonwebtoken";
const generateAccessTokenandRefreshToken=async (userId)=>{
    try {  
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken();
        
        const refreshTokens=user.generateRefreshToken();

        if(refreshTokens)
        {
            user.refreshTokens=refreshTokens
           await  user.save({validationBeforeSave:false})
        }
        return {accessToken,refreshTokens};
    } catch (error) {
        throw new ApiError(500,`Something went wrong :: ${error}`)
    }
}
const registerUser=asyncHandler( async (req,res)=>{
    //get the user details from frontend
    //validation -- not empty 
    //check if already registered
    //check if avtar is there
    //upload image on cloudinary
    //check if avtar is uploaded successfully
    //create object user and send it to or basically create entry to  database
    //remove password and refresh tokens and return the response
    


    //get deatils 
    const {username,fullname,email,password}=req.body; // get the data through form or json  
    console.log("Email: ",email);
    // if(fullname==="")
    // {
    //     throw new ApiError(400,"Fullname is required")
    // }

    


    // validation of field data coming from user
    if([fullname,username,email,password].some((field)=>field?.trim===""))
    {
        throw new ApiError(400,"ALL THE FIELDS ARE REQUIRED");
    }
    if(!email.includes("@"))
    { throw new ApiError(400,"Enter the correct format of email");

    }


    //check for already exist

    const existedUser=await User.findOne({

        $or: [ { username },{ email }],
    }
    )
    if(existedUser)
    {
        throw new ApiError(409,"user with this email or username already exist");
    }

    //files check and uploading
    console.log(req.files)

    const avtarLocalPath=req.files?.avtar[0]?.path
    let coverImagePath
    // const coverImagePath=req.files?.coverImage[0]?.path;
    if(req.files&&Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0)
    {
        coverImagePath=req.files?.coverImage[0]?.path;
    }
    if(!avtarLocalPath)
    {
        throw new ApiError(409,"Avtar file is required");
    }
    console.log(avtarLocalPath)
    console.log(coverImagePath)
    
    
       const avtar=await  uploadFile(avtarLocalPath);
  
       const coverImage= await uploadFile(coverImagePath);
  
    
    if(!avtar)
    {  throw new ApiError(500,"Internal Server Error")

    }


    // creating user 

    const user=await User.create({
        fullname,
        avtar:avtar.url,
        username:username.toLowerCase(),
        email,
        coverImage:coverImage?.url||"",
        password,
        
        
    })

    const createdUser=await User.findById(user._id).select(
        " -password -refreshTokens"
    )
    if(!createdUser)
    {
        throw new ApiError(500,"Something went wrng while creating the user")
    }

    res.status(201).json(
       new ApiResponse(201,"Successfully registered",createdUser)
    )
})

const loginUser=asyncHandler(async (req,res)=>{
    //get the details from frontend  req.body->data
    // validation username,email
    //check if the details is there in databse or not || finding user
    //check password get password from frontend and match it 
    // we will give an access token to  user 
    //we will give an refresh token
    // send cookie
    // if access token gets expired then use refresh token to login again

    const {username,email,password}=req.body;
    console.log(req.body)
    if([username,email,password].some((field)=>field?.trim===""))
    {
        throw new ApiError(400,"Enter username or email")
    }

    // const user=await User.findOne({
    //     $or: [{username},{email}]
    // })
    const user=await User.findOne({
        $or:[{username},{email}],
    });
   
    let ispasswordcorrect
    
    if(!user)
    {
      throw new ApiError(401,"User not registered")
    }
    console.log(password)
    console.log(user.password)
    ispasswordcorrect=await user.isPassword(password)
    console.log(ispasswordcorrect)
    if(!ispasswordcorrect)
    {
        throw new ApiError(401,"Incorrect Password")
    }
   const {accessToken,refreshTokens}=await generateAccessTokenandRefreshToken(user._id);
   const loggedInUser=await User.findById(user._id).select("-password -refreshTokens")
   

   //to set cookies
    const options={
        httpOnly:true,
        securte:true
    }

    return res
          .status(200)
          .cookie("accessToken",accessToken,options)
          .cookie("refershTokens",refreshTokens,options)
          .json(new ApiResponse(200,"Successfully logged in",{
            user:loggedInUser,
            accessToken:accessToken,
            refreshTokens:refreshTokens,
          }))
})
const logoutuser=asyncHandler(async(req,res)=>{

  const user=await User.findById(req.user._id);
  user.refreshTokens=undefined;
  user.save({validationBeforeSave:false})
  const options={
    httpOnly:true,
    secure:true
  }
  res.status(200).clearCookie("refreshTokens",options).clearCookie("accessToken",options).json(
    new ApiResponse(200,"Loggedout successfully",{})
  )

})

const refreshAccessToken=asyncHandler(async (req,res)=>{
    const incomingrefreshToken=req.cookies.refreshTokens||req.body.refreshTokens;
    if(!incomingrefreshToken)
    {
        throw new ApiError(401,"Unauthorized token")
    }
    const decodedData= jwt.verify(incomingrefreshToken,process.env.EFRESH_TOKEN_SECRET)
    const user=await User.findById(decodedData._id);
    if(!user)
    {
        throw new ApiError(401,"Unauthorized token")
    }

    if(user.refreshTokens!==incomingrefreshToken)
    {  throw new ApiError(401,"Refresh token is expired or used")

    }
   const {accessToken,refreshTokens}=await generateAccessTokenandRefreshToken(user._id);
   const options={
    httpOnly:true,
    server:true
   }
   const loginUser=await User.findById(user._id).select("-password -refreshTokens")
   return req.status(200).cookie("accessToken",accessToken,options).cookie("refreshTokens",refreshTokens,options).json(
    new ApiResponse(200,"successfully refreshed access token",loginUser)
   )
})


const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldpassword,newpassword}=req.body;
    if(!(oldpassword||newpassword))
    {
        throw new ApiError(400,"Enter password");

    }
    const user=await User.findById(req.user?._id);
    // if(!user)
    // {
    //     throw new ApiError(401,"User not found")
    // }

    const correctOldPassword=await user.isPassword(oldpassword);
    if(!correctOldPassword)
    {
        throw new ApiError("401"," Enter Correct old password ");
    }

    user.password=newpassword;
   await  user.save({validationBeforeSave:false});

    return res
    .status(200)
    .json(new ApiResponse(200,"Password Changed successfully",{}))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,"current user found successfully",req.user))
})

const updateAccount=asyncHandler(async (req,res)=>{
    const {fullname,username,email}=req.body;
    if([fullname,username,email].some((field)=>field?.trim===""))
    {
        throw new ApiError(401,"fullname,username and email is required")
    }

    // const user=await User.findById(req.user?._id);
    // user.fullname=ffullname
    // user.email=email;
    // user.username=username;
    // await user.save({validationBeforeSave:false})
    // const loggedInUser=await User.findById(user?._id).select("-password -refreshToken")

    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullname,
            email,
            username
        }
    },
        {new:true //return updated user

        }).select("-password -refreshTokens");
    return res
    .status(200)
    .json(new ApiResponse(200,"Changes updated successfully",user));


})

const updateAvtar=asyncHandler(async(req,res)=>{
    let updateAvtarLocalPath
    if(req.file)
    {
       updateAvtarLocalPath=req.file.path;
    }
    if(!updateAvtarLocalPath)
    {
        throw new ApiError(400,"Avtar is required ")
    }

    const updatedAvtar=await uploadFile(updateAvtarLocalPath);
    if(!updatedAvtar.url)
    {
        throw new ApiError(500,"upload failed")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avtar:updatedAvtar?.url,
        }
    },{new:true}).select("-password -refreshTokens" )
    return res
    .status(200)
    .json(new ApiResponse(200,"Avtar Updated Successfully",user))
})

const updatecoverImage=asyncHandler(async(req,res)=>{
    let updateCoverImageLocalPath
    if(req.file)
    {
        updateCoverImageLocalPath=req.file.path;
    }
    if(!updateCoverImageLocalPath)
    {
        throw new ApiError(400,"CoverImage is required ")
    }

    const updatedCoverImage=await uploadFile(updateAvtarLocalPath);
    if(!updatedCoverImage.url)
    {
        throw new ApiError(500,"upload failed")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage:updatedCoverImage.url
        }
    },{new:true}).select("-password -refreshTokens" )
    return res
    .status(200)
    .json(new ApiResponse(200,"CoverImage Updated Successfully",user))
})
export {
    registerUser,
    loginUser,
    logoutuser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccount,
    updateAvtar,
    updatecoverImage
}
