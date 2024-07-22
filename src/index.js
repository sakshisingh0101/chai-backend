// require('dotenv').config();
import dotenv from 'dotenv'
// import mongoose from 'mongoose'
// import { dbName } from './constants.js';
import {app} from './app.js'
import express from 'express';


dotenv.config({path:'./.env'})
import dbconnect from './db/index.js';
dbconnect()
.then(()=>{
  app.on('error',(error)=>{
    console.log("Error :: " ,error);
    throw error;
  })
  app.listen(process.env.PORT||8000,()=>{
    console.log(`The App is listening on ${process.env.PORT}`)
  })
})
.catch((error)=>{
    console.log('Error ',error);
})
















/*

import express from 'express';
const app=express();
;(async function ()
{   
    try{
     const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`)
    //  app.on('error',(error)=>{
    //     console.log("Error:: ",error)
    //     throw error;
    //  })
    //  app.listen(process.env.PORT,()=>{
    //     console.log(`The server is listening on the port ${process.env.PORT}` )

    //  })
    console.log(`Db Host:: ${connectionInstance.connection.host}` )
    }
    catch(error)
    {
        console.log("Connection error::" ,error);
        throw error;
    }

})();*/