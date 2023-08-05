import { MIN_WIDTH_PREFIXES } from './consts';

/**
 * Searches for a prefix in the MIN_WIDTH_PREFIXES array that matches the beginning of the utility string.
 * 
 * @param {string} util The string to search for a matching prefix.
 * @returns {number} The index of the matching prefix + 1, or 0 if no match is found.
 */
function encodeMinWidthPrefix(util: string): number {
    for (let currentPrefix of MIN_WIDTH_PREFIXES)
        if (util.startsWith(currentPrefix))
            return MIN_WIDTH_PREFIXES.indexOf(currentPrefix) + 1;

    return 0;
}

/**
 * Sorts a space-separated string of utility classes by their prefixes and returns the sorted string.
 * 
 * @param {string} classString The space-separated string of utility classes to sort.
 * @returns {string} The sorted space-separated string of utility classes.
 */
function sortClassString(classString: string): string {
    let utilsWithoutPrefixes: { [key: string]: string } = {};

    for (let currentUtil of classString.split(/\s+/)) {
        utilsWithoutPrefixes[currentUtil] = currentUtil.split(':').pop()!;
        if (utilsWithoutPrefixes[currentUtil].startsWith('-'))
            utilsWithoutPrefixes[currentUtil] = utilsWithoutPrefixes[currentUtil].substring(1);

        utilsWithoutPrefixes[currentUtil] = `${utilsWithoutPrefixes[currentUtil].split('-')[0]}-${encodeMinWidthPrefix(currentUtil)}`;
    }

    const sortedUtils = Object.keys(utilsWithoutPrefixes).sort((a, b) => {
        return utilsWithoutPrefixes[a].localeCompare(utilsWithoutPrefixes[b]);
    });

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
        ref: 'heads/' + context.payload.repository.default_branch,
    });

    return context.octokit.rest.git.createRef({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        ref: `refs/heads/${branchName}`,
        sha: mainBranchRef.data.object.sha
    });
}