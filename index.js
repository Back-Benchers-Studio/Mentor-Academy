import express from 'express'
import dotenv from "dotenv"
import axios from 'axios'
import morgan from "morgan";
import dbConnection from './Database/DBConnection.js'
import { init } from './src/modules/index.router.js';
import cors from "cors"

dotenv.config()
const app = express()
const port = 7000
app.use(cors())

app.use(express.json())
if (process.env.MODE == 'development') {
    app.use(morgan('dev'))
}

init(app)

// app.get('/',async (req,res)=>{
//     const code = req.query.code;

//     try{
//         const response = await axios.post('https://zoom.us/oauth/token',null,{
//             params:{
//                 grant_type: 'authorization_code',
//                 code:code,
//                 redirect_uri: process.env.REDIRECT_URI
//             },
//             headers:{
//                 'Authorization':`Basic ${Buffer.from(`${process.env.ZOOM_API_KEY}:${process.env.ZOOM_API_SECRET}`).toString('base64')}`
//             }
//         });
//         res.send(response.data.access_token);    
//     }catch(error){
//         console.error('Error',error);
//         res.send('Error');
//     }
    
// });

// app.get('/auth/zoom',(req,res)=>{
//     const clientId = process.env.ZOOM_API_KEY;
//     const redirect_uri = encodeURIComponent(process.env.REDIRECT_URI);
//     const responseType = 'code';
//     const authorizationUrl = `https://zoom.us/oauth/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirect_uri}`;
//     res.redirect(authorizationUrl);
// });
// app.get('/callback',async(req,res)=>{
//     const code = req.query.code;
//     if(!code){
//         return res.status(400).send('No code provided');
//     }
//     try{
//         const response = await axios.post('https://zoom.us/oauth/token',null,{params:{
//             grant_type:'authorization_code',
//             code,
//             redirect_uri:process.env.REDIRECT_URI
//         },headers:{
//             'Authorization':`Basic ${Buffer.from(`${process.env.ZOOM_API_KEY}:${process.env.ZOOM_API_SECRET}`).toString('base64')}`,
//             'Content-Type':'application/x-www-form-urlencoded'
//         }});
//         res.json(response.data);
//     }catch(error){
//         console.error('Error:',error);
//         res.send('Error obtaining token');
//     }
// })
// app.get('/refreshToken',async(req,res)=>{
//     try{
//         const refresh_token = req.query.refreshToken;

//         const response = await axios.post('https://zoom.us/oauth/token',null,{
//             params:{
//                 grant_type:'refresh_token',
//                 refresh_token
//             },
//             headers:{
//                 'Authorization':`Basic ${Buffer.from(`${process.env.ZOOM_API_KEY}:${process.env.ZOOM_API_SECRET}`).toString('base64')}`,
//                 'Content-Type':'application/x-www-form-urlencoded'
//             }
//         });

//         res.json(response.data);

//     }catch(error){
//         console.error('Error',error);
//         res.send('Error refreshing token')
//     }
// })


//const token = process.env.TOKEN;

// import jwt from 'jsonwebtoken'
// const payload ={
//     iss:process.env.ZOOM_API_KEY,
//     exp:((new Date()).getTime()+5000)
// }
// const token = jwt.sign(payload,process.env.ZOOM_API_SECRET)

// async function getMeetings(){
//     try{
//         const response = await axios.get('https://api.zoom.us/v2/users/me/meetings',{
//             headers:{
//                 'Authorization':`Bearer ${token}`
//             }
//         });
//         const data = response.data;
//         return data;
//     }catch(error){
//         console.error('Error',error);
//     }
// }

// async function createMeeting(topic, start_time,type,duration,timezone,agenda){
//     try{
//         const response = await axios.post('https://api.zoom.us/v2/users/me/meetings',{
//             topic,
//             type,
//             start_time,
//             duration,
//             timezone,
//             agenda,
//             settings:{
//                 host_video:true,
//                 participant_video:true,
//                 join_before_host:false,
//                 mute_upon_entry:true,
//                 watermark:false,
//                 use_pmi:false,
//                 approval_type:0,
//                 audio:'both',
//                 auto_recording:'none'
//             }
//         },{
//             headers:{
//                 'Authorization':`Bearer ${token}`
//             },

//         });
//         const body = response.data;
//         return body;
//     }catch(error){
//         console.error('Error',error);
//     }
// }

// (async()=>{
//     console.log(await getMeetings());
//     console.log(await createMeeting('Mentor Academy new meeting','2023-11-20T10:00:00',2,45,'UTC','Team meeting for future videos'));
//     console.log(await getMeetings());
// })()






// Twilio Room Meeting

// import { v4 as uuidv4 } from 'uuid';
// // create the twilioClient
// import twilio from 'twilio';
// const AccessToken = twilio.jwt.AccessToken;
// const VideoGrant = AccessToken.VideoGrant;
// const twilioClient = twilio(
//   process.env.TWILIO_API_KEY_SID,
//   process.env.TWILIO_API_KEY_SECRET,
//   { accountSid: process.env.TWILIO_ACCOUNT_SID }
// );

// const findOrCreateRoom = async (roomName) => {
//     try {
//       // see if the room exists already. If it doesn't, this will throw
//       // error 20404.
//       await twilioClient.video.rooms(roomName).fetch();
//     } catch (error) {
//       // the room was not found, so create it
//       if (error.code == 20404) {
//         await twilioClient.video.rooms.create({
//           uniqueName: roomName,
//           type: "go",
//         });
//       } else {
//         // let other errors bubble up
//         throw error;
//       }
//     }
//   };
  
//   const getAccessToken = (roomName) => {
//     // create an access token
//     const token = new AccessToken(
//       process.env.TWILIO_ACCOUNT_SID,
//       process.env.TWILIO_API_KEY_SID,
//       process.env.TWILIO_API_KEY_SECRET,
//       // generate a random unique identity for this participant
//       { identity: uuidv4() }
//     );
//     // create a video grant for this specific room
//     const videoGrant = new VideoGrant({
//       room: roomName,
//     });
  
//     // add the video grant
//     token.addGrant(videoGrant);
//     // serialize the token and return it
//     return token.toJwt();
//   };

//   app.post("/join-room", async (req, res) => {
//     // return 400 if the request has an empty body or no roomName
//     if (!req.body || !req.body.roomName) {
//       return res.status(400).send("Must include roomName argument.");
//     }
//     const roomName = req.body.roomName;
//     // find or create a room with the given roomName
//     findOrCreateRoom(roomName);
//     // generate an Access Token for a participant in this room
//     const token = getAccessToken(roomName);
//     res.send({
//       token: token,
//     });
//   });



dbConnection()
app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`))


  
