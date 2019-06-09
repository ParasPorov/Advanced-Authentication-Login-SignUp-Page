
var express          = require('express'),
    app              = express(),
    mongoose         = require('mongoose'),
    flash            = require("connect-flash"),
    User             = require("./models/user")
    Passport         = require("passport")
    LocalStrategy    = require("passport-local")
    PassportMongoose = require("passport-local-mongoose"),
    ExpressSession   = require("express-session")
    bodyParser       = require("body-parser"),
    Route            = require("./routes/user");

    mongoose.connect("mongodb://localhost:27017/Auth_Demo_app",{ useNewUrlParser: true });

    // For body-parser
    app.use(bodyParser.urlencoded({extended:true}));

    //  USE To encode and Decode Session
    app.use(ExpressSession({

        secret:"Hey we Are here",
        resave:false,
        saveUninitialized:false,
        
    }));

    app.use(flash());

    
    app.use(function(req,res,next){
        res.locals.success = req.flash("success");
        res.locals.error   = req.flash("error");
        res.locals.log     = req.isAuthenticated();
        next();
    })

    app.use(Validator());


    // Passport configuration
    app.use(Passport.initialize());
    app.use(Passport.session());
    
    Passport.use(new LocalStrategy(User.authenticate()));
    Passport.serializeUser(User.serializeUser());
    Passport.deserializeUser(User.deserializeUser());


    app.use('/', Route);


    app.listen(5000,function(){
        console.log("Here We Go");
    })    