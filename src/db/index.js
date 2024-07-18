import mongoose from "mongoose";
import { dbName } from "../constants.js";
const dbconnect=async ()=>{
    try {
       const connectInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`);
       console.log(`DB CONNECTED !! DB HOST:: ${connectInstance.connection.host}`);

    } catch (error) {
        console.log("Connection error ::" ,error);
        process.exit(1);
    }
}
export default dbconnect;