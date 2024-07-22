import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadFile } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
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
export {registerUser} 