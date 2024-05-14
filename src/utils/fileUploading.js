
import multer from "multer"
import { AppError } from "./AppError.js"

let options = (folderName) => {
  const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //   cb(null, folderName);
    // },
    // filename: function (req, file, cb) {
    //   cb(null, file.originalname);
    // }
  });

  function fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
      cb(null, true);
    } else {
      cb(new AppError('Images and videos only', 400), false);
    }
  }

  const upload = multer({ storage, fileFilter });
  return upload;
};


// let options = (folderName) => {
//   const storage = multer.diskStorage({})

//   function fileFilter(req, file, cb) {
//       if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
//         cb(null, true);
//       } else {
//         cb(new AppError('Images and videos only', 400), false);
//       }
//     }
//   const upload = multer({ storage, fileFilter })
//   return upload
// }
// 

export const uploadSingleFile = (fieldName, folderName) => options(folderName).single(fieldName)

export const uploadMixOfFile = (arrayOfFields, folderName) => options(folderName).fields(arrayOfFields)
