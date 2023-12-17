// ---------------------------------------------------
// SERVER INITIALIZATION AND CONFIGURATION SETUP
// ---------------------------------------------------

import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import { Octokit, App } from "octokit";
import { createNodeMiddleware } from "@octokit/webhooks";

import setupWebhooks from "./config/webhooks.js";

// 1) Load environment variables from .env file
dotenv.config();

// 2) Set configured values
const appId = process.env.GITHUB_APP_IDENTIFIER;
const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const secret = process.env.GITHUB_WEBHOOK_SECRET;
const privateKey = fs.readFileSync(privateKeyPath, "utf8");

// 2) Intiliazing Express and GitHub App instances
const app = express(); // Express server
const ghApp = new App({ // GitHub App
  appId: appId,
  privateKey: privateKey,
  webhooks: {
    secret,
  },
});

// 3) Enabling settings for being able to read JSON and parse url encoded data in requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupWebhooks(ghApp);

// Launch a web server to listen for GitHub webhooks
const port = process.env.PORT || 3000;
const webhookPath = "/api/webhook";
const webhookUrl = `http://localhost:${port}${webhookPath}`;

// 4) Subscribe webhook events to express server instance
const webhookMiddleware = createNodeMiddleware(ghApp.webhooks, {path: webhookPath});
app.use(webhookMiddleware);

// 8) Running instance of Express server in selected port
app.listen(port, () => {
  console.log(`Server is listening for events at: ${webhookUrl}`);
  console.log("Press Ctrl + C to quit.");
});
