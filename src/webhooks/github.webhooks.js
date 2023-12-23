import { createOrUpdateChangesetFile } from "../controllers/changeset.controllers.js";

export const setupWebhooks = (ghApp) => {
  ghApp.webhooks.on("pull_request.opened", async ({ octokit, payload }) => {
    console.log(
      `Received a pull request creation event for #${payload.pull_request.number}`
    );
    await createOrUpdateChangesetFile(ghApp, octokit, payload);
  });

  ghApp.webhooks.on("pull_request.edited", async ({ octokit, payload }) => {
    console.log(
      `Received a pull request edition event for #${payload.pull_request.number}`
    );
    await createOrUpdateChangesetFile(ghApp, octokit, payload);
  });

  ghApp.webhooks.onError((error) => {
    // Error handling logic
    console.error("Error handling webhook:", error);
  });
};

export default setupWebhooks;

// export const githubWebhookHandler = async (req, res) => {
//   const event = req.headers["x-github-event"];
//   const payload = req.body;
//   const octokit = req.octokit;

//   switch (event) {
//     case "pull_request":
//       if (payload.action === "opened") {
//         await handlePullRequestOpened({ payload, octokit });
//       }
//       break;
//     // Handle other GitHub events as needed
//   }

//   res.status(200).send("Event received");
// };
