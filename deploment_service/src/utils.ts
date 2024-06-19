import { exec } from "child_process"
import path from "path"

export function buildProject(id: string) {
    console.log(`Building project ${id}...`);

    return new Promise((resolve, reject) => {
        const child = exec(`cd ${path.join(__dirname, `/output/${id}`)} && npm install && npm run build`)
        
        child.stdout?.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr?.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        child.on('close', function(code) {
            console.log('closing code: ' + code);
            resolve("");
        });
    
    })
    console.log(`Built project ${id} successfully.`);

}