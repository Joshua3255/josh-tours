const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

//new Email(user, url).sendWelcome();
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //PostMark
      return (
        nodemailer,
        nodemailer.createTransport({
          host: process.env.POSTMARK_HOST,
          port: 587, // Port can be 587 or 25
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.POSTMARK_USERNAME, // Typically, this is the Postmark Server Token
            pass: process.env.POSTMARK_PASSWORD // Typically, this is the Postmark Server Token
          }
        })
      );
      // Sendgrid
      // return (
      //   nodemailer,
      //   nodemailer.createTransport({
      //     service: 'SendGrid',
      //     auth: {
      //       user: process.env.SENDGRID_USERNAME,
      //       pass: process.env.SENDGRID_PASSWORD
      //     }
      //   })
      // );
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
      //Activate in gmail "less secure app" option
    });
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    );

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // 3) Create a transport and send email
    // await transporter.sendMail(mailOptions);
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      'welcome',
      'Welcome to the JoshTours Family!'
    );
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
