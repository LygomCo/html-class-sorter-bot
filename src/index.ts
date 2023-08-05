import { Probot } from 'probot';
import { createBranch, endsWithAny, htmlWithSortedClassStrings } from './utils';
import { PullFile } from './types';
import { FILE_TYPES_TO_SORT } from './consts';

export = (app: Probot) => {
    app.on('pull_request.closed', async context => {
        const pullRequest = context.payload.pull_request;

        //? Only check for merged pull requests in main branch
        const targetBranch = pullRequest.base.ref;
        if (targetBranch !== 'main' || !pullRequest.merged)
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
            const sortedContent = htmlWithSortedClassStrings(fileContent);
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

        try {
            createBranch(context, `${pullRequest.number}-sorted-classes`)
        }
        catch (err) {
            console.error(err);
            return;
        }

            // TODO: Commit changed files

            // TODO: Create pull request
    });
    // For more information on building apps:
    // https://probot.github.io/docs/

    // To get your app running against GitHub, see:
    // https://probot.github.io/docs/development/
};
