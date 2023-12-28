// ---------------------------------------------------
// SERVER INITIALIZATION AND CONFIGURATION SETUP
// ---------------------------------------------------

import express from "express";
import fs from "fs";
import { Webhooks, createNodeMiddleware } from "@octokit/webhooks";

import releaseNotesRouter from "./routes/releaseNotes.routes.js";

import {
  GITHUB_APP_WEBHOOK_SECRET,
  PORT,
  API_PATH_SUFFIX,
} from "./config/constants.js";

import { setupWebhooks } from "./webhooks/github.webhooks.js";

// 2) Intiliazing express instance
const app = express(); // Express server

// 5) Setup webhook middleware
const webhookUrl = `${API_PATH_SUFFIX}/webhooks`;
const webhooks = new Webhooks({
  secret: GITHUB_APP_WEBHOOK_SECRET,
});
const webhookMiddleware = createNodeMiddleware(webhooks, {
  path: webhookUrl,
});
app.use(webhookMiddleware);

// 3) Setup body-parsing  middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4) Setup webhook events handlers
setupWebhooks(webhooks, webhookUrl);

// 5) Suscribe API routes
app.use(API_PATH_SUFFIX, releaseNotesRouter);

// 6) Running instance of Express server in selected port
app.listen(PORT, () => {
  console.log(`Server is listening in port: ${PORT}`);
  console.log("Press Ctrl + C to quit.");
});
