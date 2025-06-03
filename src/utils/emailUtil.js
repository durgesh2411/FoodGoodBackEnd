import nodemailer from "nodemailer";
// import schedule from "node-schedule";
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: process.env.GMAIL_PORT,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const sendMail = async ({ to, subject, text }) => {
  const mailOptions = {
    from: process.env.GMAIL_USERNAME,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Error occurred while sending email:", error.message);
  }
};

export { sendMail };
