// src/middlewares/octokitClient.js
import { Octokit } from "@octokit";
import { createOctokitClient } from "../utils/githubUtils.js";

export const attachOctokitClient = async (req, res, next) => {
  try {
    // Assumes that the installation ID is part of the webhook payload
    const installationId = req.body.installation.id;
    if (!installationId) {
      throw new Error("No installation ID found in webhook payload");
    }

    const octokitClient = await createOctokitClient(installationId);
    req.octokit = octokitClient;

    next();
  } catch (error) {
    console.error("Error in attachOctokitClient middleware:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
