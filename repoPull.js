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

function detectDefinedTerms(path = repoTempFolder + 'SMLC-Terminology/terminology/', folder = '/terminology/') {
    const files = fs.readdirSync(path);
    terms = {};
    for (const file of files) {
        if (!file.endsWith('.md') && !file.endsWith('.markdown') && !file.endsWith('.mdx')) {
            // check if file is a folder
            if (fs.lstatSync(path +
                file).isDirectory()) {
                const childTerms = detectDefinedTerms(path + file + '/', folder + file + '/');
                for (const term in childTerms) {
                    terms[term] = childTerms[term];
                }
            }
            continue;
        }
        const content = fs.readFileSync(path + file, 'utf-8');
        const lines = content.split('\n');
        let lineTerms = [];
        for (const line of lines) {
            if (!line.includes("**")) {
                continue;
            }
            let segments = line.split('**');
            for (let i = 1; i < segments.length; i += 2) {
                lineTerms.push(segments[i]);
                // remove the file extension from the link name
                const linkName = file.split('.')[0];
                terms[segments[i].toLocaleLowerCase()] = {
                    file: folder + linkName,
                    excerpt: null,
                }
            }
        }
        // split the file into sentences so we can find the terms in context (and show them on hover)
        // split by ., !, and ? and \n / \r
        let sentences = content.split(/[\.\!\?\n\r]/);
        for (const sentence of sentences) {
            for (const term of lineTerms) {
                if (sentence.includes("**" + term + "**")) {
                    if (!terms[term.toLocaleLowerCase()]) {
                        return;
                    }
                    let trimmed = sentence.trim();
                    // trim off spaces and dashes
                    while (trimmed.startsWith(' ') || trimmed.startsWith('-')) {
                        trimmed = trimmed.slice(1);
                    }
                    terms[term.toLocaleLowerCase()].excerpt = trimmed;
                }
            }
        }
    }
    return terms;
}

function insertTermHyperlinks(terms, path = repoTempFolder + 'SMLC-Standards/standards/', folder = '/standards/') {
    const files = fs.readdirSync(path);
    console.log(files);
    for (const file of files) {
        if (!file.endsWith('.md') && !file.endsWith('.markdown') && !file.endsWith('.mdx')) {
            // check if file is a folder
            if (fs.lstatSync(path +
                file).isDirectory()) {
                insertTermHyperlinks(terms, path + file + '/', folder + file + '/');
            }
            continue;
        }
        const content = fs.readFileSync(path + file, 'utf-8');
        let newContent = content;
        // find FIRST instance of term in file (if it exists) and replace it with a hyperlink
        for (const term in terms) {
            if (newContent.includes(term)) {
                let termLink = `[${term}](` + terms[term].file + ")";
                // replace first instance of term with hyperlink
                splitContent = newContent.split(term);
                newContent = splitContent[0] + termLink + splitContent.slice(1).join(term);
            }
        }
        if (newContent !== content) {
            fs.writeFileSync(path + file, newContent);
            console.log('Inserted term hyperlinks into ' + file);
        }
    }
}
async function main() {
    await deleteAndRecreateRepoTemp();

    for (const repoUrl of gitRepos) {
        await cloneRepo(repoUrl);
    }
    let terms = detectDefinedTerms();
    // sort terms by descending length (by key) so we can replace longer terms first
    terms = Object.fromEntries(Object.entries(terms).sort((a, b) => b[0].length - a[0].length));
    console.log(terms);
    insertTermHyperlinks(terms);
}

main();