import { spawn } from "child_process";
import path from "path";
import fs from "fs";

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
        CMD ["npm", "run", "build"]
        `;
        
    fs.writeFileSync(dockerfilePath, dockerfileContent.trim());
    }

    try {
        // Build the Docker image
        console.log(`Building Docker image for project ${id}...`);
        await new Promise<void>((resolve, reject) => {
            const build = spawn('docker', ['build', '-t', `project-${id}`, projectPath]);

            build.stdout.on('data', (data) => {
                console.log(`Docker build stdout: ${data}`);
            });

            build.stderr.on('error', (data) => {
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
        await new Promise<void>((resolve, reject) => {
            const run = spawn('docker', ['run', '-v', `${projectPath}/dist:/usr/src/app/dist`, `project-${id}`]);

            run.stdout.on('data', (data) => {
                console.log(`Docker run stdout: ${data}`);
            });

            run.stderr.on('error', (data) => {
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