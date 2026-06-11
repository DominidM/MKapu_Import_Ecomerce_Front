import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "banners/carousel";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isVideo = file.type.startsWith("video/");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadOptions: any = {
      folder,
      resource_type: "auto",
    };

    if (!isVideo) {
      uploadOptions.transformation = [
        { width: 1920, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ];
    } else {
      uploadOptions.transformation = [
        { width: 1920, height: 1080, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
        { video_codec: "auto" },
      ];
    }

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}