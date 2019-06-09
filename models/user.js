
var mongoose=require("mongoose"),
    PassportLocalMongoose=require("passport-local-mongoose");

var UserSchema=new mongoose.Schema({
  
    username: String,
    fullname:String,
    password: String,
    secretToken:String,
    isActive:Boolean,

})

UserSchema.plugin(PassportLocalMongoose);


module.exports=mongoose.model("User",UserSchema);