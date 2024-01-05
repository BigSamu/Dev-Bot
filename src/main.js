// ---------------------------------------------------
// SERVER INITIALIZATION AND CONFIGURATION SETUP
// ---------------------------------------------------

import express from "express";
import { Webhooks, createNodeMiddleware } from "@octokit/webhooks";

import releaseNotesRouter from "./routes/releaseNotes.routes.js";
import fileRouter from "./routes/file.routes.js";
import {
  errorRequestHandler,
  ensureGitHubAppInstalled,
} from "./middlewares/index.js";

import {
  GITHUB_APP_WEBHOOK_SECRET,
  PORT,
  API_PATH_SUFFIX,
} from "./config/constants.js";

import { setupWebhooks } from "./webhooks/github.webhooks.js";

// 2) Intiliazing express instance
const app = express(); // Express server

// 3) Setup webhook middleware
const webhookUrl = `${API_PATH_SUFFIX}/webhooks`;
const webhooks = new Webhooks({
  secret: GITHUB_APP_WEBHOOK_SECRET,
});
const webhookMiddleware = createNodeMiddleware(webhooks, {
  path: webhookUrl,
});
app.use(webhookMiddleware);

// 4) Setup body-parsing  middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5) Setup webhook events handlers
setupWebhooks(webhooks, webhookUrl);

// 6) Ensure GitHub App is installed in the repository
app.use(ensureGitHubAppInstalled);

// 7) Suscribe API routes
app.use(API_PATH_SUFFIX, releaseNotesRouter);
app.use(API_PATH_SUFFIX, fileRouter);

// 8) Setup error handlers middlewares for requests
app.use(errorRequestHandler);

// 9) Running instance of Express server in selected port
app.listen(PORT, () => {
  console.log(`Server is listening in port: ${PORT}`);
  console.log("Press Ctrl + C to quit.");
});
