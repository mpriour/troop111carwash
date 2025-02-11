import { writeAsyncIterableToWritable } from "@react-router/node";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

async function* streamToAsyncIterator(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

async function uploadImage(data: ReadableStream<Uint8Array>) {
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
    
    writeAsyncIterableToWritable(streamToAsyncIterator(data), uploadStream);
  });
}

if(process.env.NODE_ENV != "production"){
  console.log("configs", cloudinary.v2.config());
}
export { uploadImage };
