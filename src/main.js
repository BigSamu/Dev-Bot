// ---------------------------------------------------
// SERVER INITIALIZATION AND CONFIGURATION SETUP
// ---------------------------------------------------

import express from "express";
import fs from "fs";
import { App } from "octokit";
import { Webhooks, createNodeMiddleware } from "@octokit/webhooks";

import releaseNotesRouter from "./routes/releaseNotes.routes.js";

import {
  GITHUB_APP_IDENTIFIER,
  GITHUB_APP_PRIVATE_KEY,
  GITHUB_APP_WEBHOOK_SECRET,
} from "./utils/constants.js";

import setupWebhooks from "./config/webhooks.js";

// 2) Intiliazing Express, GitHub App and Webhooks instances
const app = express(); // Express server
const ghApp = new App({
  appId: GITHUB_APP_IDENTIFIER,
  privateKey: GITHUB_APP_PRIVATE_KEY,
});

const webhooks = new Webhooks({
  secret: GITHUB_APP_WEBHOOK_SECRET
});

// 3) Enabling settings for being able to read JSON and parse url encoded data in requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4) Defining port and webhook path
const port = process.env.PORT || 3000;
const webhookPath = "/api/webhook";

// 5) Subscribe webhook events to express server instance
const webhookMiddleware = createNodeMiddleware(webhooks, {
  path: webhookPath,
});
app.use(webhookMiddleware);

// 6) Setup Webhooks Events Handlers
setupWebhooks(ghApp);

// 7) Importing API routes and incorporating them to 'app' instance
app.use('/api/release-notes', releaseNotesRouter);


// 7) Running instance of Express server in selected port
app.listen(port, () => {
  console.log(`Server is listening in port: ${port}`);
  console.log("Press Ctrl + C to quit.");
});
