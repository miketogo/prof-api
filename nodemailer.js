const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport(
    {
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
            user: 'no-reply.prof-uk@mail.ru',
            pass: 'EiP$rs3iiEO8'
        }
    },
    {
        from: 'Профессионал УК <no-reply.prof-uk@mail.ru>',
    }

)

const mailer = message => {
    transporter.sendMail(message, (err, info) => {
        if(err) return console.log(err)
        console.log('Email sent: ', info)
    })
}

module.exports = mailer