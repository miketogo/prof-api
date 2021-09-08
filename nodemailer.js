const nodemailer = require('nodemailer')
require('dotenv').config();
const emailPass = process.env.MAIL_PASS;
const transporter = nodemailer.createTransport(
    {
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
            user: 'no-reply@prof-uk.ru',
            pass: emailPass,
        }
    },
    {
        from: 'Профессионал УК <no-reply@prof-uk.ru>',
    }

)

const mailer = message => {
    transporter.sendMail(message, (err, info) => {
        if(err) return console.log(err)
        console.log('Email sent: ', info)
    })
}

module.exports = mailer 