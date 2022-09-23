const path = require('path');
const nodeMailer = require('nodemailer');
const sendInBlue = require('sib-api-v3-sdk');
const ejs = require('ejs');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.from = `Khubaib Sajid <${process.env.EMAIL_FROM}>`;
    this.url = url;
    this.location = user.firstLocation;
  }

  // hviRM6Xqp9LkGRz;

  createTransporter() {
    // if (process.env.NODE_ENV === 'production') {
    //   return nodeMailer.createTransport({
    //     service: 'SendinBlue',
    //     auth: {
    //       user: process.env.SEND_IN_BLUE_USER_NAME,
    //       pass: process.env.SEND_IN_BLUE_PASSWORD,
    //     },
    //   });
    // }
    return nodeMailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: process.env.host,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
  }

  async sendEmail(template, subject) {
    // 1 Path of email template
    const html = await ejs.renderFile(
      path.join(`{__dirname}`, `..`, `views`, `emails`, `${template}.ejs`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // 2 Mail option: will go into transporter
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };

    // 3 Sending email
    await this.createTransporter().sendMail(mailOptions);
  }

  async sendOrderEmail(template, subject, orderImage) {
    // 1 Path of email template
    const html = await ejs.renderFile(
      path.join(`{__dirname}`, `..`, `views`, `emails`, `${template}.ejs`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
        orderImage,
        location: this.location,
      }
    );

    // 2 Mail option: will go into transporter
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      attachments: [
        {
          // stream as an attachment
          filename: `${orderImage}`,
          path: path.join(
            `${__dirname}`,
            `..`,
            `public`,
            `images`,
            `orders`,
            `${orderImage}`
          ),
          cid: 'unique-Order',
        },
      ],
    };

    // 3 Sending email
    await this.createTransporter().sendMail(mailOptions);
  }

  async sendWelcomeEmail() {
    await this.sendEmail('welcomeEmail', 'Welcome to our family 🎉😊');
  }

  async sendPasswordResetEmail() {
    await this.sendEmail('resetPasswordEmail', 'Your Password Reset Email');
  }

  async sendNewOrderEmail(image) {
    // const imagePath = path.join(
    //   __dirname,
    //   'public',
    //   'images',
    //   'orders',
    //   `${image}`
    // );
    await this.sendOrderEmail(
      'newOrder',
      'A new order has been received',
      image
    );
  }
};
