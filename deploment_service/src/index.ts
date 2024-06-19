import { createClient, commandOptions } from "redis";
import { downloadFromS3, copyFinalDist } from "./aws";
import { buildProject } from "./utils";

const subscriber = createClient();
subscriber.connect(); //localhost:6379

async function main() {
    while(1){
        const response = await subscriber.brPop(
            commandOptions({isolated: true}), 
            "build-queue", 
            0);

        console.log(response);
        //response returns { key: 'build-queue', element: 'mlw7zjs' }
        //but ts shows string
        //@ts-ignore
        const id = response.element;
        await downloadFromS3(`output/${id}/`);
        await buildProject(id);
        await copyFinalDist(id);
    }
    //build processing logic

}   

main();