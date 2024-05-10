import  nodemailer from "nodemailer";

export const sendEmail = async (email , htmlBody , subject)=>{
    
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            service:"gmail",
            auth: {
                user: 'backbenchersteam23@gmail.com',
                pass:'23@backbenchers@23Team'
               //pass:'12345BB'
                //user: process.env.SENDER_EMAIL, // generated ethereal user
                //pass: process.env.SENDER_kEY, // generated ethereal password
            }
        });
 
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Mentor Academy" <backbenchersteam23@gmail.com>', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            text: "Hello world?", // plain text body
            html: htmlBody, // html body
        });
    }


// module.exports = sendEmail;
