const fs = require('fs');
const child_process = require('child_process');

const repoTempFolder = 'repoTemp/';
const gitRepos = [
    'https://github.com/Scrap-Mechanic-Logic-Consortium/SMLC-Standards.git',
    'https://github.com/Scrap-Mechanic-Logic-Consortium/SMLC-Terminology.git',
    // Add more repositories here if needed
];

async function deleteAndRecreateRepoTemp() {
    try {
        if (fs.existsSync(repoTempFolder)) {
            fs.rmSync(repoTempFolder, { recursive: true, force: true });
        }
        fs.mkdirSync(repoTempFolder);
        console.log('Repo temp folder created/reset');
    } catch (error) {
        console.error('Error handling repo temp folder:', error);
    }
}

async function cloneRepo(repoUrl) {
    try {
        child_process.execSync(`git clone ${repoUrl}`, { cwd: repoTempFolder });
        console.log(`Repository cloned: ${repoUrl}`);
    } catch (error) {
        console.error(`Error cloning ${repoUrl}`, error);
    }
}

async function main() {
    await deleteAndRecreateRepoTemp();

    for (const repoUrl of gitRepos) {
        await cloneRepo(repoUrl);
    }
}

main();