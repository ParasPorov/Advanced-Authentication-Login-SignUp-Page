
var nodemailer= require("nodemailer")

const transport=nodemailer.createTransport({
    service: 'mail.testingPurpose.com',
    port: 587,
    secure:false,
    auth: {
      user: "YOUR MAIL ID",
      pass: "YOUR PASSWORD",
    },
    tls: {
      rejectUnauthorized: false,
    }
});


module.exports = {
  sendEmail(from, to, subject, html) {
      
      transport.sendMail({ from, subject, to, html }, function(err, info){
        if (err)
          console.log(err);
        else
           console.log(info);
      });
    }
  }
