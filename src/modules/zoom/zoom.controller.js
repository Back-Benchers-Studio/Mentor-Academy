
import axios from 'axios'
import btoa from "btoa";

const clientId = "86q1S9QTSP2Rs4xyPTbZA"
"L9z0I3X8TEavFriMI3db8Q"
const accountId = "jArhkXoISdSAF6eVvD6T9Q"
"jArhkXoISdSAF6eVvD6T9Q"
const clientSecret = "sBUwHQyRzBbpgNONTPCW6qegqBF0sBNV"
"HaXS716ptUc0mHTdqfchZHA02FIoUMj4"
const auth_token_url = "https://zoom.us/oauth/token"
const api_base_url = "https://api.zoom.us/v2"





export const createZoomMeeting = async (req, res, next) => {

  const { topic, duration, start_time } = req.body
  try {
    //   const authResponse = await axios.post(auth_token_url, {
    //     grant_type: 'account_credentials',
    //     account_id: accountId,
    //    // client_secret: clientSecret
    // }, {
    //     auth: {
    //         username: clientId,
    //         password: clientSecret
    //     }
    // });

    const base_64 = btoa(clientId + ":" + clientSecret);
    const authResponse = await axios({
      method: "POST",
      url:
        "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" +
        `${accountId}`,
      headers: {
        Authorization: "Basic " + `${base_64} `,
      },
    });
    console.log(authResponse);

    if (authResponse.status !== 200) {
      console.log('Unable to get access token');
      return;
    }

    const access_token = authResponse.data.access_token;
    console.log({ "Aceess Token ": access_token });
    const headers = {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    };

    const startTime = `${start_time}T10:${start_time}`;

    const payload = {
      topic: topic,
      duration: duration,
      start_time: start_time,
      type: 2
    };

    const meetingResponse = await axios.post(`${api_base_url}/users/me/meetings`, payload, { headers });

    if (meetingResponse.status !== 201) {
      console.log('Unable to generate meeting link');
      return;
    }

    const response_data = meetingResponse.data;

    const content = {
      meeting_url: response_data.start_url,
      password: response_data.password,
      meetingTime: response_data.start_time,
      purpose: response_data.topic,
      duration: response_data.duration,
      message: 'Success',
      status: 1
    };

    console.log(content);
    res.status(200).json({ Response: content })
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: error })
  }
}


export const getZoomMeetings = async (req, res, next) => {
  try {
    const base_64 = btoa(clientId + ":" + clientSecret);
    const authResponse = await axios({
      method: "POST",
      url:
        "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" +
        `${accountId}`,
      headers: {
        Authorization: "Basic " + `${base_64} `,
      },
    });
    console.log(authResponse);

    if (authResponse.status !== 200) {
      console.log('Unable to get access token');
      return;
    }

    const access_token = authResponse.data.access_token;
    console.log({ "Aceess Token ": access_token });
    const headers = {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    };


    const meetingResponse = await axios.get(`${api_base_url}/users/me/meetings`, { headers });

    if (meetingResponse.status !== 200) {
      console.log('Unable to get meetings');
      return;
    }

    const response_data = meetingResponse.data.meetings;
    // const newArray = response_data.map((obj) =>
    //   ["id", "topic"].reduce((newObj, key) => {
    //     newObj[key] = obj[key];
    //     // return newObj;
    //   }, {})
    // );
    res.status(200).json({ Response: response_data })
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: error })
  }
}
