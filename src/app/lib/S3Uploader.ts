
import path from "path";
import fs from "fs/promises";
import { Readable } from "stream";
import {

  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ObjectCannedACL,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import config from "../../config";
import { s3Client } from "./S3Client";
// import { removeFile } from "../utils/removeFile";


// **Multipart Upload to DigitalOcean Spaces**
const uploadToS3 = async (
  file: Express.Multer.File,
  folder?: string
): Promise<{ Location: string; Bucket: string; Key: string }> => {
  if (!file) {
    throw new Error("File is required for uploading.");
  }
  if (!file.path || !file.mimetype || !file.originalname) {
    throw new Error("Invalid file data provided.");
  }
  const Bucket = config.S3.bucketName || "";
  const Key = folder ? `sparkeyc/${folder}/${file.originalname}` : `sparkeyc/${file.originalname}`;

  try {
    const fileBuffer = await fs.readFile(file.path);
    const command = new PutObjectCommand({
      Bucket: config.S3.bucketName,
      Key,
      Body: fileBuffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    });

    const uploadResult = await s3Client.send(command);
    // const { UploadId } = await s3Client.send(createMultipartUpload);

    if (!uploadResult) {
      throw new Error("Failed to initiate multipart upload.");
    }
    // Remove local file after successful upload
    // await removeFile(file.path);
    return {
      Location: `https://${Bucket}.s3.amazonaws.com/${Key}`,
      Bucket,
      Key,
    };
  } catch (error) {
    console.error("Error in multipart upload:", error);

    throw error;
  }
};
export const downloadFileFromS3 = async (s3Url: string): Promise<{ blob: Blob; fileName: string; mimeType: string }> => {
  const s3Response = await fetch(s3Url);

  if (!s3Response.ok) {
    throw new Error(`S3 download failed: ${s3Response.status} ${s3Response.statusText}`);
  }

  const fileName = (s3Url.split("/").pop() ?? "upload").split("?")[0];
  const mimeType = s3Response.headers.get("content-type") || "application/octet-stream";
  const blob = await s3Response.blob();

  console.log(`⬇️ Downloaded from S3: ${fileName} (${(blob.size / 1024).toFixed(2)} KB)`);

  return { blob, fileName, mimeType };
};
// **Abort Multipart Upload (Optional)**
const abortMultipartUpload = async (
  Bucket: string,
  Key: string,
  UploadId: string
) => {
  try {
    const abortCommand = new AbortMultipartUploadCommand({
      Bucket,
      Key,
      UploadId,
    });
    await s3Client.send(abortCommand);
  } catch (error) {
    console.error("Error aborting multipart upload:", error);
  }
};

// Export file uploader methods
export const S3Uploader = {
  abortMultipartUpload,
  uploadToS3,
};
