import { S3 } from "aws-sdk";
import fs from "fs";

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

//two arguments because currently files have absolute paths. But we want to upload only the relative path
export const uploadToS3 = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const params = {
        Bucket: "vercel.bt",
        Key: fileName,
        Body: fileContent
    };
    const response = await s3.upload(params).promise();
    console.log(response);
}