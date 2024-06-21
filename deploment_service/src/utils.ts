import { exec, spawn } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function buildProject(id: string) {
    console.log(`Building project ${id}...`);

    const projectPath = path.join(__dirname, `/output/${id}`);
    const dockerfilePath = path.join(projectPath, "Dockerfile");

    if (!fs.existsSync(dockerfilePath)) {
        const dockerfileContent = `
        # Dockerfile.template
        FROM node:16
        WORKDIR /usr/src/app
        COPY package*.json ./
        RUN npm install
        COPY . .
        RUN npm run build
        COPY -r dist/* .
        # Set permissions (if needed)
        # RUN chown -R node:node /usr/src/app
        # Set user to non-root user
        # USER node
        `;
        
    fs.writeFileSync(dockerfilePath, dockerfileContent.trim());
    }
    // Copy Dockerfile.template to the project directory as Dockerfile
   // fs.copyFileSync(path.join(__dirname, "Dockerfile.template"), dockerfilePath);

    // Build the Docker image
    // try {
    //     await execAsync(`docker build -t project-${id} ${projectPath}`);
    //     console.log(`Docker image for project ${id} built successfully.`);
        
    //     // Run the Docker container
    //     await execAsync(`docker run --rm -v ${projectPath}/dist:/usr/src/app/dist project-${id}`);
    //     console.log(`Project ${id} built successfully in Docker container.`);
    // } catch (error) {
    //     console.error(`Error building project ${id}:`, error);
    //     throw error;
    // } finally {
    //     // Clean up: remove the Dockerfile from the project directory
    //     fs.unlinkSync(dockerfilePath);
    // }
    try {
        // Build the Docker image
        console.log(`Building Docker image for project ${id}...`);
        await new Promise<void>((resolve, reject) => {
            const build = spawn('docker', ['build', '-t', `project-${id}`, projectPath]);

            build.stdout.on('data', (data) => {
                console.log(`Docker build stdout: ${data}`);
            });

            build.stderr.on('data', (data) => {
                console.error(`Docker build stderr: ${data}`);
            });

            build.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Docker build process exited with code ${code}`));
                } else {
                    resolve();
                }
            });
        });

        console.log(`Docker image for project ${id} built successfully.`);

        // Run the Docker container
        console.log(`Running Docker container for project ${id}...`);
        const containerName = `project-${id}-container`;
        await new Promise<void>((resolve, reject) => {
            const run = spawn('docker', ['run', '-v', `${projectPath}/dist:/usr/src/app/dist`, `project-${id}`]);

            run.stdout.on('data', (data) => {
                console.log(`Docker run stdout: ${data}`);
            });

            run.stderr.on('data', (data) => {
                console.error(`Docker run stderr: ${data}`);
            });

            run.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Docker run process exited with code ${code}`));
                } else {
                    resolve();
                }
            });
        });

        console.log(`Project ${id} built successfully in Docker container.`);

        // Check if the dist directory has files
        const distFiles = fs.readdirSync(path.join(projectPath, 'dist'));
        if (distFiles.length === 0) {
            throw new Error(`No files were found in ${projectPath}/dist after build`);
        }
    } catch (error) {
        console.error(`Error building project ${id}:`, error);
        throw error;
    } finally {
        // Clean up: remove the Dockerfile from the project directory
        fs.unlinkSync(dockerfilePath);
    }
}


// import { exec } from "child_process"
// import path from "path"
// import fs from "fs"


// export function buildProject(id: string) {
//     console.log(`Building project ${id}...`);

//     return new Promise((resolve, reject) => {
    
        
//         const child = exec(`cd ${path.join(__dirname, `/output/${id}`)} && npm install && npm run build`)
        
//         child.stdout?.on('data', function(data) {
//             console.log('stdout: ' + data);
//         });
//         child.stderr?.on('data', function(data) {
//             console.log('stderr: ' + data);
//         });

//         child.on('close', function(code) {
//             console.log('closing code: ' + code);
//             resolve("");
//         });
    
//     })

// }