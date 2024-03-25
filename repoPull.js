const fs = require('fs');
const child_process = require('child_process');

const repoTempFolder = 'repoTemp/';
// read gitRepos.json
let gitRepos = JSON.parse(fs.readFileSync('gitRepos.json', 'utf-8'));

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

async function cloneRepo(repoDef, targetFolder) {
    // {
    //     "repo": "https://github.com/Scrap-Mechanic-Logic-Consortium/SMLC-Standards.git",
    //     "branch": "main",
    //     "commit": "0166435"
    // },
    try {
        child_process.execSync(`git clone ${repoDef.repo} ${repoTempFolder + targetFolder}`);
        child_process.execSync(`git -C ${repoTempFolder + targetFolder} checkout ${repoDef.branch}`);
        child_process.execSync(`git -C ${repoTempFolder + targetFolder} checkout ${repoDef.commit}`);
        console.log(`Repository cloned: ${repoDef.repo} branch: ${repoDef.branch} commit: ${repoDef.commit}`);
    } catch (error) {
        console.error(`Error cloning ${repoDef.repo} branch: ${repoDef.branch} commit: ${repoDef.commit}`, error);
    }
}

function detectDefinedTerms(path, sitePath) {
    const files = fs.readdirSync(path);
    terms = {};
    for (const file of files) {
        if (!file.endsWith('.md') && !file.endsWith('.markdown') && !file.endsWith('.mdx')) {
            // check if file is a folder
            if (fs.lstatSync(path +
                file).isDirectory()) {
                const childTerms = detectDefinedTerms(path + file + '/', sitePath + file + '/');
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
                    file: sitePath + linkName,
                    pathFile: path + file,
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

function insertTermHyperlinks(terms, path, sitePath) {
    const files = fs.readdirSync(path);
    console.log(files);
    for (const file of files) {
        if (!file.endsWith('.md') && !file.endsWith('.markdown') && !file.endsWith('.mdx')) {
            // check if file is a folder
            if (fs.lstatSync(path +
                file).isDirectory()) {
                insertTermHyperlinks(terms, path + file + '/', sitePath + file + '/');
            }
            continue;
        }
        let content = fs.readFileSync(path + file, 'utf-8');
        let madeChanges = false;
        let newContent = "";
        // find FIRST instance of term in file (if it exists) and replace it with a hyperlink
        let accumulator = "";
        const nogoSeqs = { // contains pairs of character sequences. the first one is the sequence that deactivates hyperlink insertion, the second one is the sequence that reactivates it
            "#": ["\n"],
            "[": ["]", "\n"],
            "(/": [")", "\n"],
            "(/http": [")", "\n"],
            "`": ["`", "\n"],
        };
        let awaitingEndSequence = null;
        for (let i = 0; i < content.length; i++) {
            accumulator += content[i];
            // check if accumulator ends with a sequence that deactivates hyperlink insertion
            for (const seq in nogoSeqs) {
                if (accumulator.endsWith(seq)) {
                    awaitingEndSequence = nogoSeqs[seq];
                }
            }
            // check if accumulator ends with a sequence that reactivates hyperlink insertion
            if (awaitingEndSequence && accumulator.endsWith(awaitingEndSequence[0])) {
                awaitingEndSequence = null;
            }
            if (!awaitingEndSequence) {
                // if accumulator.lower ends with a term, cut out the term and replace it with a hyperlink, then reset accumulator
                for (const term in terms) {
                    if (terms[term].pathFile === path + file) {
                        continue;
                    }
                    if (accumulator.toLocaleLowerCase().endsWith(term)) {
                        const termWithCase = accumulator.slice(-term.length);
                        const link = `[${termWithCase}](${terms[term].file})`;
                        newContent += content.slice(0, i - term.length + 1) + link;
                        content = content.slice(i);
                        i = 0;
                        accumulator = "";
                        madeChanges = true;
                    }
                }
            }
        }
        newContent += accumulator;
        if (madeChanges) {
            fs.writeFileSync(path + file, newContent);
            console.log('Inserted term hyperlinks into ' + file);
        }
    }
}

function insertEmojis(emojis, path) {
    const files = fs.readdirSync(path);
    for (const file of files) {
        console.log(path + file);
        if (!file.endsWith('.md') && !file.endsWith('.markdown') && !file.endsWith('.mdx')) {
            // check if file is a folder
            if (fs.lstatSync(path +
                file).isDirectory()) {
                insertEmojis(emojis, path + file + '/');
            }
            continue;
        }
        let content = fs.readFileSync(path + file, 'utf-8');
        let newContent = content;
        // replace all emojis "tags" with the actual emoji, ex: :target: -> 🎯
        for (const emoji in emojis) {
            const emojiTag = ':' + emoji + ':';
            const emojiChar = emojis[emoji];
            newContent = newContent.replaceAll(emojiTag, emojiChar);
        }
        if (newContent !== content) {
            fs.writeFileSync
                (path + file, newContent);
            console.log('Inserted emojis into ' + file);
        }
    }
}

async function main() {
    await deleteAndRecreateRepoTemp();
    let repoFolders = [];
    for (const repoDef of gitRepos) {
        await cloneRepo(repoDef, repoFolders.length + '/');
        repoFolders.push(repoFolders.length + '/')
    }
    configs = [];
    let terms = {};
    for (const folder of repoFolders) {
        const configData = JSON.parse(fs.readFileSync(repoTempFolder + folder + "config.json", 'utf-8'))
        configs.push(
            {
                ...configData,
                folder: folder
            }
        )
    }
    for (const configData of configs) {
        if (configData.buckets.includes('terms')) {
            // add detectDefinedTerms to terms
            terms = {
                ...terms,
                ...detectDefinedTerms(repoTempFolder + configData.folder + configData.dataFolder, "/" + configData.routeBasePath + "/")
            }
        }
    }

    let emojis = JSON.parse(fs.readFileSync('emojiList.json', 'utf-8'));
    // sort emojis by descending length (by key) so we can replace longer emojis first
    emojis = Object.fromEntries(Object.entries(emojis).sort((a, b) => b[0].length - a[0].length));
    for (const configData of configs) {
        insertEmojis(emojis, repoTempFolder + configData.folder + configData.dataFolder);
    }

    // terms = detectDefinedTerms();
    // sort terms by descending length (by key) so we can replace longer terms first
    terms = Object.fromEntries(Object.entries(terms).sort((a, b) => b[0].length - a[0].length));
    console.log(terms);
    for (const configData of configs) {
        if (configData.buckets.includes('docs') || configData.buckets.includes('terms')) {
            insertTermHyperlinks(terms, repoTempFolder + configData.folder + configData.dataFolder, "/" + configData.routeBasePath + "/");
        }
    }
    // insertTermHyperlinks(terms);
    const docusaurusConfigTemplate = fs.readFileSync('docusaurus.config.ts.template', 'utf-8');
    let inserts = [];
    for (const configData of configs) {
        //replace / in routeBasePath with _ to make it a valid id
        let id = configData.routeBasePath.replace(/\//g, '_');
        inserts.push(
            "['@docusaurus/plugin-content-docs',{\"id\":\"" + id + "\",\"path\":\"" + repoTempFolder + configData.folder + configData.dataFolder + "\",\"routeBasePath\":\"" + configData.routeBasePath + "\", sidebarPath: require.resolve('./sidebars.js')}],"
        );
    }
    // replace __dataFolderInsert__ with the inserts
    let docusaurusConfig = docusaurusConfigTemplate.replace('__dataFolderInsert__', inserts.join(''));
    fs.writeFileSync('docusaurus.config.ts', docusaurusConfig);
}
main();