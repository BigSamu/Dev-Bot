import { createOrUpdateChangesetFile } from "../controllers/changeset.controllers.js";

export const setupWebhooks = (webhooks,webhookUrl) => {

  webhooks.on("pull_request.opened", async ({ payload }) => {
    console.log(
      `Received a pull request creation event for #${payload.pull_request.number}`
    );
    await createOrUpdateChangesetFile(payload);
  });

  webhooks.on("pull_request.edited", async ({ payload }) => {
    console.log(
      `Received a pull request edition event for #${payload.pull_request.number}`
    );
    await createOrUpdateChangesetFile(payload);
  });

  webhooks.onError((error) => {
    // Error handling logic
    console.error("Error handling webhook:", error);
  });
};
