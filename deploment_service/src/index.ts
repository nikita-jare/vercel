import { createClient, commandOptions } from "redis";
import { downloadFromS3, copyFinalDist } from "./aws";
import { buildProject } from "./utils";

const subscriber = createClient();
subscriber.connect(); //localhost:6379

const publisher = createClient();
publisher.connect();

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
        try {
            await downloadFromS3(`output/${id}/`);
            console.log(`Downloaded project ${id} successfully.`);

            await buildProject(id);
            console.log(`Built project ${id} successfully.`);

            await copyFinalDist(id);
            console.log(`Copied final dist for project ${id} successfully.`);

            // Set status of id in database
            await publisher.hSet("status", id, "deployed");
            console.log(`Project ${id} status set to deployed.`);
        } catch (error) {
            console.error(`Error processing ${id}:`, error);
            // Optionally, set a failure status in the database
            await publisher.hSet("status", id, "failed");
        }
    }
}   

main();