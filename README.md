## Build Vercel System

To Read: `https://vercel.com/blog/behind-the-scenes-of-vercels-infrastructure`

Three steps to building Vercel:

1. Upload project files
2. Creating deployment -- building project, and spit right set of HTML, CSS, JS assets
3. Request Phase

They heavily rely on AWS constructs.

- High level System Design of Vercel
- simple-git: npm module to clone git repos. Its very light weight and gives a slightly cleaner API than git.

  Steps to code:

1. Initialise empty TypeScript project
2.

create bucket on S3 Amazon or R2 Cloudflare
function to upload a file to S3 given an input path
