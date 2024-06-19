import { S3 } from "aws-sdk";
import path from "path";
import fs from "fs";

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function downloadFromS3 (prefix: string) {
    console.log(`Downloading project ${prefix} from S3...`);
    const params = {
        Bucket: "vercel.bt",
        Prefix: prefix
    };
    const allFiles = await s3.listObjectsV2(params).promise();

    const allPromises = allFiles.Contents?.map(async ({Key}) => {
        return new Promise (async(resolve) => {
            if(!Key) {
                resolve(""); 
                return;
            }
            
            const finalOutputPath = path.join(__dirname, Key);
            const dirName = path.dirname(finalOutputPath);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName, { recursive: true });
            }
            const outputFile = fs.createWriteStream(finalOutputPath);                
            s3.getObject({ 
                Bucket: "vercel.bt",
                Key: Key || "" 
            }).createReadStream().pipe(outputFile)
            .on("finish", () => {
                resolve("");
            })    
        })       
    }) || [];
    await Promise.all(allPromises?.filter(x => x !== undefined));

}

export function copyFinalDist(id: string) {
    console.log(`Copying final dist for project ${id}...`);
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        uploadToS3(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    })
}

export const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);
    allFilesAndFolders.forEach((file) => {
        const fullPath = path.join(folderPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
           response = response.concat(getAllFiles(fullPath));
        } else {
            response.push(fullPath);
        }
    });
    return response;
}

export const uploadToS3 = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const params = {
        Bucket: "vercel.bt",
        Key: fileName,
        Body: fileContent
    };
    const response = await s3.upload(params).promise();
    console.log(response);
    console.log("Uploaded successfully");
}
