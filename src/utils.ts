import { MODIFIERS_LIST } from './consts';
import { PullFile } from './types';

/**
 * Searches for a prefix in the MIN_WIDTH_PREFIXES array that matches the beginning of the utility string.
 * 
 * @param {string} util The string to search for a matching prefix.
 * @returns {string} The index of all the matching prefix + 1, or 0 if no match is found.
 */
const encodeModifiers = (util: string): string => {
    const encodingNumber: string[] = new Array(Object.keys(MODIFIERS_LIST).length).fill('0');
    const prefixesList: string[] = util.split(':').slice(0, -1);

    if (prefixesList.length === 0)
        return encodingNumber.join('');

    for (const curUtilPrefix of prefixesList) {
        const modifiedPrefix = `${curUtilPrefix}:`;

        for (let i = 0; i < Object.values(MODIFIERS_LIST).length; i++) {
            const modifierList = Object.values(MODIFIERS_LIST)[i];
            if (modifierList.includes(modifiedPrefix)) {
                encodingNumber[i] = String(modifierList.indexOf(modifiedPrefix) + 1);
                break;
            }
        }
    }

    return encodingNumber.join('');
};


/**
 * Sorts utility's prefixes by MODIFIERS_LIST order and sublist index.
 * 
 * @param {string} util The string to sort it's prefixes.
 * @returns {string} The utility with sorted prefixes.
 */
const sortUtilPrefixes = (util: string): string => {
    const prefixesList: string[] = util.split(':').slice(0, -1);

    if (prefixesList.length === 0)
        return util;

    const sortKey = (prefix: string): [number, number] => {
        const modifierValues = Object.values(MODIFIERS_LIST);

        for (let i = 0; i < modifierValues.length; i++) {
            const modifierList = modifierValues[i];
            if (modifierList.includes(`${prefix}:`))
                return [i, modifierList.indexOf(`${prefix}:`)];
        }

        return [modifierValues.length, 0];  // In case the prefix is not found
    };

    const sortedPrefixes = prefixesList.slice().sort((a, b) => {
        const [groupA, indexA] = sortKey(a);
        const [groupB, indexB] = sortKey(b);

        if (groupA !== groupB)
            return groupA - groupB;

        return indexA - indexB;
    });

    const sortedUtil = `${sortedPrefixes.join(':')}:${util.split(':').slice(-1)[0]}`;

    return sortedUtil;
};

/**
 * Removes suffix number or user input [...] of the utility string.
 * 
 * @param {string} util The string to replace its suffix.
 * @returns {string} The util without the number or user input suffix.
 */
function removeNumbersAndBracketsInput(util: string) {
    const pattern = /-\[.*\]|-(?!\d+[a-zA-Z])\d+/g;

    return util.replace(pattern, '-');
}

/**
 * Gets placeholders from class string.
 * 
 * @param {string} classString The class string to get the placeholders.
 * @returns {string[]} A list with all placeholders.
 */
function extractPlaceholdersFromClassString(classString: string): string[] {
    const placeholderPattern = /\$\{(.*?)\}/g;
    const placeholders: string[] = [];
    let match;

    while ((match = placeholderPattern.exec(classString)) !== null) {
        placeholders.push(match[0]);
    }

    return placeholders;
}

/**
 * Sorts a space-separated string of utility classes by their prefixes and returns the sorted string.
 * 
 * @param {string} classString The space-separated string of utility classes to sort.
 * @returns {string} The sorted space-separated string of utility classes.
 */
function sortClassString(classString: string): string {
    const placeholders = extractPlaceholdersFromClassString(classString);

    placeholders.forEach(placeholder => {
        classString = classString.replace(placeholder, '');
    });

    let utilsWithoutPrefixes: { [key: string]: string } = {};

    for (let currentUtil of classString.split(/\s+/)) {
        currentUtil = sortUtilPrefixes(currentUtil)
        utilsWithoutPrefixes[currentUtil] = currentUtil.split(':').pop()!;
        if (utilsWithoutPrefixes[currentUtil].startsWith('-'))
            utilsWithoutPrefixes[currentUtil] = utilsWithoutPrefixes[currentUtil].substring(1);

        utilsWithoutPrefixes[currentUtil] = `${removeNumbersAndBracketsInput(utilsWithoutPrefixes[currentUtil])}${encodeModifiers(currentUtil)}`
    }

    const sortedUtils = Object.keys(utilsWithoutPrefixes).sort((a, b) => {
        return utilsWithoutPrefixes[a].localeCompare(utilsWithoutPrefixes[b]);
    });

    sortedUtils.push(...placeholders);
    
    return sortedUtils.join(' ');
}

/**
 * Extracts all unique CSS class strings from an HTML code string.
 * 
 * @param {string} htmlCode The HTML code string to extract class strings from.
 * @returns {Set<string>} A set of unique CSS class strings.
 */
function extractClassesFromHtml(htmlCode: string): Set<string> {
    const classPattern = /class(?:Name)?=[`'"](.*?)[`'"]/g;
    const classListPattern = /class\:list=\{\[((?:.|\n)*?)\]\}/g;
    const classListContentPattern = /[`"']([^`"']*)[`"']/g;

    let classStrings: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = classPattern.exec(htmlCode)) !== null)
        classStrings.push(match[1]);

    while ((match = classListPattern.exec(htmlCode)) !== null) {
        const classListContent = match[1];
        let classListMatches: RegExpExecArray | null;

        while ((classListMatches = classListContentPattern.exec(classListContent)) !== null)
            classStrings.push(classListMatches[1]);
    }

    return new Set(classStrings);
}

/**
 * Fixes the order of CSS classes' strings in an HTML code string.
 * 
 * @param {string} htmlCode The HTML code string to fix.
 * @returns {string} The fixed HTML code string.
 */
export function htmlWithSortedClassStrings(htmlCode: string): string {
    const classes = Array.from(extractClassesFromHtml(htmlCode));
    const sortedClasses = classes.map(sortClassString);

    for (let i = 0; i < sortedClasses.length; i++)
        htmlCode = htmlCode.replace(classes[i], sortedClasses[i].trim());

    return htmlCode;
}

/**
 * Checks if a string ends with any of the given extensions.
 * 
 * @param {string[]} extensions An array of extensions to check for.
 * @param {string} fileName The file name to check.
 * @returns {boolean} True if the file name ends with any of the extensions, false otherwise.
 */
export function endsWithAny(extensions: string[], fileName: string): boolean {
    for (let extension of extensions)
        if (fileName.endsWith(extension))
            return true;

    return false;
}

/**
 * Creates a new branch with the given name based on the main branch of the repository.
 * 
 * @param {Context} context The Probot context object.
 * @param {string} branchName The name of the new branch to create.
 * @returns {Promise<any>} A promise that resolves with the response data from the Git API.
 */
export async function createBranch(context: any, branchName: string): Promise<any> {
    const mainBranchRef = await context.octokit.rest.git.getRef({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        ref: 'heads/' + context.payload.repository.default_branch
    });

    return context.octokit.rest.git.createRef({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        ref: `refs/heads/${branchName}`,
        sha: mainBranchRef.data.object.sha
    });
}

/**
 * Creates a new Git blob for the given file content.
 * 
 * @param {Context} context The Probot context object.
 * @param {string} fileContent The content of the file to create a blob for.
 * @returns {Promise<string>} A promise that resolves with the SHA of the new Git blob.
 */
async function createBlobForFile(context: any, fileContent: string): Promise<string> {
    const blobData = await context.octokit.rest.git.createBlob({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        content: fileContent,
        encoding: 'utf-8'
    });

    return blobData.data.sha;
}

/**
 * Creates a new Git tree with the given files based on the specified base tree.
 * 
 * @param {Context} context The Probot context object.
 * @param {string} baseTreeSha The SHA of the base tree to use as a starting point.
 * @param {PullFile[]} files An array of PullFile objects representing the files to add to the tree.
 * @returns {Promise<any>} A promise that resolves with the response data from the Git API.
 */
async function createNewTreeWithFiles(context: any, baseTreeSha: string, files: PullFile[]): Promise<any> {
    const newTree = await Promise.all(files.map(async (file) => ({
        path: file.filename,
        mode: '100644',
        type: 'blob',
        sha: await createBlobForFile(context, file.content)
    })));

    const { data: newTreeData } = await context.octokit.rest.git.createTree({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        base_tree: baseTreeSha,
        tree: newTree
    });

    return newTreeData;
}

/**
 * Creates a new Git commit with the given message, new tree SHA, and parent SHA.
 * 
 * @param {Context} context The Probot context object.
 * @param {string} message The commit message.
 * @param {string} newTreeSha The SHA of the new Git tree to use for the commit.
 * @param {string} parentSha The SHA of the parent commit.
 * @returns {Promise<any>} A promise that resolves with the response data from the Git API.
 */
async function createNewCommit(context: any, message: string, newTreeSha: string, parentSha: string): Promise<any> {
    const { data: newCommitData } = await context.octokit.rest.git.createCommit({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        message,
        tree: newTreeSha,
        parents: [parentSha]
    });

    return newCommitData;
}

/**
 * Commits and pushes the given files to the specified branch.
 * 
 * @param {Context} context The Probot context object.
 * @param {string} branchName The name of the branch to commit to.
 * @param {PullFile[]} files An array of PullFile objects representing the files to commit.
 * @param {string} commitMessage The commit message to use.
 * @returns {Promise<void>} A promise that resolves when the commit and push operations are complete.
 */
export async function commitAndPushFiles(context: any, branchName: string, files: PullFile[], commitMessage: string): Promise<void> {
    const { data: mainBranchData } = await context.octokit.rest.git.getRef({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        ref: `heads/${branchName}`
    });

    const newTreeData = await createNewTreeWithFiles(context, mainBranchData.object.sha, files);

    const newCommitData = await createNewCommit(context, commitMessage, newTreeData.sha, mainBranchData.object.sha);

    await context.octokit.rest.git.updateRef({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        ref: `heads/${branchName}`,
        sha: newCommitData.sha
    });
}

/**
 * Creates a new pull request with the given branch name, base branch, title, and body.
 * 
 * @param {Context} context The Probot context object.
 * @param {string} branchName The name of the branch to create the pull request from.
 * @param {string} title The title of the pull request.
 * @param {string} body The body of the pull request.
 * @returns {Promise<any>} A promise that resolves with the response data from the Pull Requests API.
 */
export async function createPullRequest(context: any, branchName: string, title: string, body: string): Promise<any> {
    const baseBranch = context.payload.repository.default_branch; //? Usually 'main' or 'master'

    const { data: pullRequest } = await context.octokit.rest.pulls.create({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        title,
        body,
        head: branchName,
        base: baseBranch
    });

    return pullRequest;
}