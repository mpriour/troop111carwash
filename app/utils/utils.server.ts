import cloudinary from "cloudinary";
import type { Stream } from "stream";

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

async function uploadImage(fileStream: Stream) {
  return new Promise<cloudinary.UploadApiResponse | undefined>((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "t111cw",
      },
      (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      }
    );
    fileStream.pipe(uploadStream);
  });
}

if(process.env.NODE_ENV != "production"){
  console.log("configs", cloudinary.v2.config());
}
export { uploadImage };
