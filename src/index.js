// require('dotenv').config();
import dotenv from 'dotenv'

dotenv.config({path:'./env'})
import dbconnect from './db/index.js';
dbconnect();

















/*
import express from 'express';
const app=express();
;(async function connectdb()
{   
    try{
     await mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`)
     app.on('error',(error)=>{
        console.log("Error:: ",error)
        throw error;
     })
     app.listen(process.env.PORT,()=>{
        console.log(`The server is listening on the port ${process.env.PORT}` )
     })
    }
    catch(error)
    {
        console.log("Connection error::" ,error);
        throw error;
    }

})();*/