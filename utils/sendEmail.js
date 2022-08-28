const nodemailer = require('nodemailer');

const sendEmail = async function (options) {
  // 1 Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  // 2 Email Options
  const mailOptions = {
    from: 'Khubaib Sajid <khubaibsajid11@gmail.com', //? Later change personal email to bushiness email in production environment -
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3 Send Email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
