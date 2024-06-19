import express from "express"; //npm module that lets you create a HTTP server
import cors from "cors";
import { generateId } from "./utils";
import simpleGit from "simple-git";
import path from "path";
import { getAllFiles } from "./file";
import { uploadToS3 } from "./aws";
import {createClient} from "redis";

//initialize Redis
const publisher = createClient();
publisher.connect();

const app = express();
app.use(cors());

app.use(express.json()); //for parsing application/json - use respective middleware for thr type of data being sent

//clone the repository
app.post("/deploy", async (req, res) => {
    const githubUrl = req.body.githubUrl;
    console.log(githubUrl);

    const id = generateId();
    // const branch = `branch-${id}`;
    await simpleGit().clone(githubUrl, path.join(__dirname + `/output/${id}`));

    //retrieve paths to all files in output/id
    const files = getAllFiles(path.join(__dirname + `/output/${id}`));

    //iterate all over all files and upload them to S3
    files.forEach(async (file) => {
        await uploadToS3(file.slice(__dirname.length + 1), file);
    })

    //put the id in Redis (vercel uses SQS)
    //ToDO: use SQS API
    await publisher.lPush("build-queue", id);
    res.json({ id: id });
});

app.listen(3000, () => console.log("Server started on port 3000"));