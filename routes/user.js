  var express = require('express'),
      routes = express.Router(),
      mongoose = require('mongoose'),
      flash = require("connect-flash"),
      User = require("./../models/user")
      Passport = require("passport")
      LocalStrategy = require("passport-local")
      PassportMongoose = require("passport-local-mongoose"),
      ExpressSession = require("express-session")
      bodyParser = require("body-parser")
      Validator = require("express-validator")
      randomString = require("randomstring")
      mailer       = require("../models/mailer");



  //====================================
  //   Routes
  //====================================

  routes.get("/", function (req, res) {
      res.render("Home.ejs");
  })


  routes.get("/register", function (req, res) {
      res.render("user/register.ejs");
  })

  routes.post("/register", function (req, res) {

      // Validation

      req.checkBody('username', "Invalid Email !!").notEmpty().isEmail();
      req.checkBody('password', "Weak Password !!").notEmpty().isLength({
          min: 4
      });
      var errors = req.validationErrors();

      if (req.body.password !== req.body.password2) {
          req.flash("error", "Password not matched");
          return res.redirect("/register");
      }

      //    console.log(errors);

      if (errors) {
          var messa = [];
          for (var i = 0; i < errors.length; i++) {
              messa.push(errors[i].msg);
              req.flash("error", messa[i]);
          }
          return res.redirect("/register");
      }



      // registering new User   Passing Password in a separate argument 
      User.register(new User({
          username: req.body.username,
          fullname: req.body.fullname,
          isActive: false,
          secretToken: randomString.generate(),

      }), req.body.password, function (err, user) {

          if (err) {
              console.log(err);
              
              req.flash("error", "Something went wrong boiiii!!!!!")
              return res.redirect("/login");
          }

          if (!user.isActive) {
              // Compose email
              const html = `Hi there,
                 <br/>
                 Thank you for registering!
                  <br/><br/>
                  Please verify your email by typing the following token:
                  <br/>
                  Token: <b>${user.secretToken}</b>
                  <br/>
                  On the following page:
                  <a href="http://localhost:5000/user/verify">http://localhost:5000/user/verify</a>
                  <br/><br/>
                  Have a pleasant day.`

            
                  
              // Send email
              mailer.sendEmail( `"NodeMailerTest"<paras.porov1@gmail.com>`, user.username, 'Please verify your email!', html);

              req.flash("success", "Please ,Verify your Account");
              return res.redirect("/user/verify");
          }


          // For Authentication purpose
          Passport.authenticate("local")(req, res, function () {
              req.flash("success", `Welcome to my Sucess Page ${req.body.fullname}`);
              res.redirect("secret");
          })

      });
  })

  routes.get("/secret", isLoggedIn, function (req, res) {
      res.render("Secret.ejs");
  })

  //============================
  // LOGIN ROUTE
  //=============================


  routes.get("/login", function (req, res) {
      res.render("user/login.ejs");
  })

  // Midleware 
  // Basically passport internally takes down the data from form and compares it with the 
  // the stored data using salt (which unhash or decode the hash) and compares the credentionals
  // and accordingly perform required options by using two
  // argument

  routes.post("/login", Passport.authenticate("local", {
          failureRedirect: "/login",
          failureFlash: true,
      }),
      function (req, res) {

          var key = req.body.username;

          User.findOne({
              "username": key
          }, function (err, user) {
              if (err) {
                  req.flash("error", "Something went wrong!!")
                  return res.redirect("/user/verify");
              }

              if (user.isActive) {
                  return res.redirect("/secret");
              } else {
                  req.flash("error", "Pls verify your account  ");
                  return res.redirect("/login");
              }

          });

          req.flash("error", "User Not Exist");
          res.redirect("/login");


      });


  routes.get("/logout", function (req, res) {
      req.logout();
      req.flash("success", "Hey man you are out now ,freee!!!")
      res.redirect("login");
  })

  routes.get("/user/verify", isNotLogged, function (req, res) {
      res.render("user/verify.ejs");
  })

  routes.post("/user/verify", function (req, res) {

      var key = req.body.secretToken;

      User.findOne({
          "secretToken": key
      }, function (err, user) {
          if (err) {
              req.flash("error", "Something went wrong!!")
              return res.redirect("/user/verify");
          }

          //  For null User
          if (!user) {
              req.flash("error", "No User Exist");
              return res.redirect("/user/verify");
          }

          // empty User
          if (user.length == 0) {
              req.flash("error", "No User Exist");
              return res.redirect("/user/verify");
          }




          user.isActive = true;
          user.secretToken = "";
          user.save();
          req.flash("success", "Thank you for verify you mail !!, Pls Login  ");
          return res.redirect("/login");
      });



  })





  function isLoggedIn(req, res, next) {
      if (req.isAuthenticated()) {
          return next();
      }

      req.flash("error", "Please ,Log IN inorder to access page")
      res.redirect("login");
  }

  function isNotLogged(req, res, next) {
      if (!req.isAuthenticated()) {
          return next();
      }

      req.flash("error", "You already verified bro")
      res.redirect("/");
  }


  module.exports = routes;