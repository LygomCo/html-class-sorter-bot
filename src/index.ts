import { Probot } from "probot";

export = (app: Probot) => {
    app.on('pull_request.closed', async context => {
        const pullRequest = context.payload.pull_request;
        if (pullRequest.merged) {
            const filesChanged = await context.octokit.pulls.listFiles(context.repo({
                pull_number: pullRequest.number
            }));
    
            for (let file of filesChanged.data) {
                const content = await context.octokit.repos.getContent(context.repo({
                    path: file.filename,
                    ref: pullRequest.head.sha
                }));
    
                const fileContent = Buffer.from(content.data.toString(), 'base64').toString();
                context.log(fileContent);
            }
        }
    });
    // For more information on building apps:
    // https://probot.github.io/docs/

    // To get your app running against GitHub, see:
    // https://probot.github.io/docs/development/
};
