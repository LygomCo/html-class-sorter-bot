import { Probot } from 'probot';
import { htmlWithSortedClassStrings } from './utils';

export = (app: Probot) => {
    app.on('pull_request.closed', async context => {
        const pullRequest = context.payload.pull_request;
        if (pullRequest.merged) {
            const filesChanged = await context.octokit.pulls.listFiles(context.repo({
                pull_number: pullRequest.number
            }));

            for (let file of filesChanged.data) {
                // console.log(file.filename); //? Debug
                const content = await context.octokit.repos.getContent(context.repo({
                    path: file.filename,
                    ref: pullRequest.head.sha
                }));

                // Read the file content and decode it from base64
                const base64 = content.data['content' as keyof typeof content.data];
                const fileContent = Buffer.from(base64, 'base64').toString();
                // console.log(`Content before: \n${fileContent}\n\n\n\nContent after: \n${ htmlWithSortedClassStrings(fileContent) }`); //? Debug

                // TODO: Open branch

                // TODO: Commit changed files

                // TODO: Create pull request
            }
        }
    });
    // For more information on building apps:
    // https://probot.github.io/docs/

    // To get your app running against GitHub, see:
    // https://probot.github.io/docs/development/
};
