import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
const videoSchema=new mongoose.Schema({
   
    videoFile:{
         type:String, //cloudinary
         required:true,
         unique:true,

    },
    
    
    thumbnails:{
        type:String, //cloudinary
        required:true,
        unique:true,


    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        
    },
    title:{
        type:String, 
        required:true,

    },
    description:{
        type:String,
        required:true,

    },
    duration:{
        type:Number, //cloudinary 
        required:true,

    },
    views:{
        type:Number,
        required:true,
        default:0,

    },

    isPublished:{
        type:Boolean,
        required:true,

    },
    

},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate);
export const Video=mongoose.model('Video',videoSchema);