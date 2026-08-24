import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("GMAIL VERIFY ERROR:", error);
  } else {
    console.log("GMAIL AUTH SUCCESS:", success);
  }
});

export default transporter;