import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import { ApiError } from './apiError.js';

 // Configuration
 cloudinary.config({ 
    cloud_name:process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET // Click 'View Credentials' below to copy your API secret
});


const uploadFile=async (file)=>{
  try{  
    if(!file) return null;
    const uploadResult = await cloudinary.uploader
       .upload(
                    file, {
               resource_type:"auto",
           }
       )
       if(uploadResult)
       {  fs.unlinkSync(file);
          return uploadResult;
       }
       else
       {   
          return null;
       }
      
      
    }
    catch(error)
    {
         console.log("Error:: " ,error)
         fs.unlinkSync(file)  // remove locally saved file as the upload operation got failed
         return null
    }
}

const deleteFile=async(filepath)=>{
   try {  const deleteResult=await cloudinary.uploader.destroy(filepath,{
      resource_type:"auto"
   })
   console.log(deleteResult);
   return deleteResult;


      
   } catch (error) {
      throw new ApiError(500,"Deletionfailed");
   }
}

export {uploadFile,deleteFile}


    



