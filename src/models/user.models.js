import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
const userSchema=new mongoose.Schema({
    username:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,


    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        

    },
    fullname:{
        type: String,
        required:true,
        trim:true,
        index:true,
        

    },
    avtar:{
        type: String, //cloudnary url (service we are gonna use)
        required:true,
        unique:true,

    },
    coverImage:{
        type: String,
        
        
        sparse:true,

    },
    password:{
        type:String,
        required:[true,"Password is required"],
        lowercase:true,
        unique:true,
        min:[6,"Password can't be less than 6 characters"],
        max:[14,"Password can't be more than 14 characters"]

    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    refreshTokens:{
        type:String,

    }

},{timestamps:true})

userSchema.pre("save",async function(next){
 if(this.isModified("password"))
 {
    this.password=await bcrypt.hash(this.password,10);
    next();
 }
})

userSchema.methods.isPassword=async function(password){
    const ispassword=await bcrypt.compare(password,this.password);
    return ispassword;
}
userSchema.methods.generateAccessToken=function(){
  return jwt.sign({
    _id:this._id,
    email:this.email,
    username:this.username,
    fullname:this.fullname,
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
  }
)
}
userSchema.methods.generateRefreshToken=function(){
  return jwt.sign({
    _id:this._id,
  },
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
  }
)
}
export const User=mongoose.model("User",userSchema);