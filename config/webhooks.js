import { create_or_update_changeset } from "../changeset-creator/index.js";

const setupWebhooks = (ghApp) => {
  ghApp.webhooks.on("pull_request.created", async ({ octokit, payload }) => {
    console.log(
      `Received a pull request creation event for #${payload.pull_request.number}`
    );
    await create_or_update_changeset(ghApp,octokit, payload);
  });

  ghApp.webhooks.on("pull_request.edited", async ({ octokit, payload }) => {
    console.log(
      `Received a pull request edition event for #${payload.pull_request.number}`
    );
    await create_or_update_changeset(ghApp, octokit, payload);
  });

  ghApp.webhooks.onError((error) => {
    // Error handling logic
    console.error("Error handling webhook:", error);
  });
};

export default setupWebhooks;
