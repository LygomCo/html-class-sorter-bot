import { PullFile } from './types';

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