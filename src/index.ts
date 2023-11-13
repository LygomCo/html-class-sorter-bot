import { Probot } from 'probot';
import {
    commitAndPushFiles,
    createBranch,
    createPullRequest,
    endsWithAny } from './utils';
import { PullFile } from './types';
import { BOT_NAME, FILE_TYPES_TO_SORT } from './consts';
import { getSortedCode } from './api';

export = (app: Probot) => {
    app.on('pull_request.closed', async context => {
        const pullRequest = context.payload.pull_request;

        //? Only check for merged pull requests in main branch
        const targetBranch = pullRequest.base.ref;
        if (targetBranch !== 'main' || !pullRequest.merged || pullRequest.user.login === BOT_NAME)
            return;

        const filesInPull = await context.octokit.pulls.listFiles(context.repo({
            pull_number: pullRequest.number
        }));

        let filesSorted: PullFile[] = [];
        for (let file of filesInPull.data) {
            //? Only check for specific file types
            if (!endsWithAny(FILE_TYPES_TO_SORT, file.filename))
                continue;

            // console.log(file.filename); //? Debug
            let content: any;
            try {
                content = await context.octokit.repos.getContent(context.repo({
                    path: file.filename,
                    ref: pullRequest.head.sha
                }));
            }
            catch (err) {
                console.error(err);
                continue;
            }

            //* Read the file content and decode it from base64
            const base64 = content.data['content' as keyof typeof content.data];
            const fileContent = Buffer.from(base64, 'base64').toString();
            const response = await getSortedCode(fileContent);
            const sortedContent: string = response.data;
            // console.log(`Content before: \n${fileContent}\n\n\n\nContent after: \n${sortedContent}`); //? Debug

            if (fileContent !== sortedContent)
                filesSorted.push({
                    filename: file.filename,
                    content: sortedContent
                });
        }

        //! No files to sort
        if (filesSorted.length === 0)
            return;

        const branchName: string = `${pullRequest.number}-sorted-classes`;
        try {
            await createBranch(context, branchName);
        }
        catch (err) {
            console.error(err);
            return;
        }

        const commitDescription: string = `Sorted HTML classes for PR #${pullRequest.number}.`;
        try {
            await commitAndPushFiles(context, branchName, filesSorted, commitDescription);
        }
        catch (err) {
            console.error(err);
            return;
        }

        const prBody = `This PR was created automatically by [HTML Classes Sorter](https://github.com/LygomCo/html-class-sorter).\nIt contains the sorted HTML classes for the files that were changed in PR #${pullRequest.number}.\n\n## Changed files\n\n${filesSorted.map(file => `- ${file.filename}`).join('\n')}`;
        try {
            await createPullRequest(context, branchName, commitDescription, prBody);
        }
        catch (err) {
            console.error(err);
            return;
        }
    });
    // For more information on building apps:
    // https://probot.github.io/docs/

    // To get your app running against GitHub, see:
    // https://probot.github.io/docs/development/
};
