import multer from "multer";
import multerS3 from "multer-s3";
import config from "../../config";
import { s3Client } from "../../lib/S3Client";

const s3Storage = multerS3({
    s3: s3Client,
    bucket: config.s3.bucket_name || "", // Replace with your bucket name
    acl: "public-read", // Ensure files are publicly accessible
    contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detect content type
    key: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // File name in Spaces
    },
});


// Upload image configurations
const upload = multer({
    storage: s3Storage,
});

export const getImageUrl = async (file: Express.MulterS3.File) => {
    let image = file?.location;
    if (!image || !image.startsWith("http")) {
        image = `https://mamamoko.s3.us-east-2.amazonaws.com/${file?.key}`;
    }
    return image;
};

const uploadUserAssets = upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "resume", maxCount: 1 }
]);

const uploadFaceImage = upload.single("faceImage");
const uploadProfileImage = upload.single("profileImage");
const loginImage = upload.single("loginImage");
const uploadProductImage = upload.fields([
    { name: "images", maxCount: 5 }
]);
const uploadDocuments = upload.fields([
    { name: "documents", maxCount: 5 }
]);

export const uploadFile = {
    uploadProductImage,
    uploadProfileImage,
    uploadUserAssets,
    uploadDocuments,
    uploadFaceImage,
    loginImage
}