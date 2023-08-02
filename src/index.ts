import { Probot } from 'probot';

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

                const base64 = content.data['content' as keyof typeof content.data];
                const fileContent = Buffer.from(base64, 'base64').toString();
                // console.log('Content: ' + fileContent); //? Debug

                // TODO: Implement logic
            }
        }
    });
    // For more information on building apps:
    // https://probot.github.io/docs/

    // To get your app running against GitHub, see:
    // https://probot.github.io/docs/development/
};
