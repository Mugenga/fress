const config = require("config");
module.exports.emailTemplate = {
  activateAccount: {
    subject: "Thank you for opening an Email with us",
    emailBody: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><meta content="@hat_ernesto" name="author" /><title>Activate account</title></head>
    <body style="background-color:#edf0f3; font-family:sans-serif; font-size:12px;" ><center>
    <h3>Hello {username}<h3>
        Your Account on Fress Media was successfully created. This is your email you will use to signin.
        <h1>{email}</h1>
    </center>     
  </body></html>`,
  },
};
