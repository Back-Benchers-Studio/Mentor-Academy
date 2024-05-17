import nodemailer from "nodemailer";

export const sendEmail = async (email, htmlBody, subject) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
       host: "smtp.ethereal.email",
        port: 456,
        secure: true, // true for 465, false for other ports
        service: 'gmail',
        auth: {
            user: "newbackbenchers50@gmail.com",
            pass: "Amira.00.00.00"

            //user: 'backbenchersteam23@gmail.com',
            //pass:'Amira.11.11.11'
            // pass:'23@backbenchers@23Team'
            //pass:'12345BB'
            //user: process.env.SENDER_EMAIL, // generated ethereal user
            //pass: process.env.SENDER_kEY, // generated ethereal password
        }
    });

    // send mail with defined transport object
    //let info =
    await transporter.sendMail({
        from: "newbackbenchers50@gmail.com", // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: "Hello world?", // plain text body
        html: htmlBody, // html body
    });
}


