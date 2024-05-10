
import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
    // cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    // api_key: process.env.CLOUDINARY_API_KEY,
    // api_secret: process.env.CLOUDINARY_API_SECRET
    cloud_name: "dggku2ndg", 
        api_key: "473952283838857", 
        api_secret: "VYSrCZAvdzQBt8TkOkn1e6IGuXA"
});
export default cloudinary;
