import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File, folder = "general") {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{
    publicId: string;
    url: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
  }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `cabinet-physio/${folder}`,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Upload failed"));
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          });
        }
      )
      .end(buffer);
  });
}

export async function deleteImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}
