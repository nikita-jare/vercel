//retrieve paths to all files in output/id as we cannot directly upload a whole folder to S3
import fs from "fs";
import path from "path";

export const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    //get all files and folders in the main folder
    const allFilesAndFolders = fs.readdirSync(folderPath);

    //check for each file if it is a folder or a file
    //if it is a folder, recursively call the function
    allFilesAndFolders.forEach((file) => {
        const fullPath = path.join(folderPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            //why concat and why not push? getAllfiles will return an array
            //if we do response.push, it will push a new array to the main array
            //but we want to push just the paths to the main array
            response = response.concat(getAllFiles(fullPath));
        } else {
            response.push(fullPath);
        }
    });
    return response;
}