import mongoose, { modelNames } from "mongoose";

const likesSchema=new mongoose.Schema({
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
    },
    likedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    tweet:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tweet"
    },
    comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
    }
},{timestamps:true})
export const Like=mongoose.model("Like",likesSchema)