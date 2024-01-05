import { App } from "octokit";
import {
  GITHUB_APP_IDENTIFIER,
  GITHUB_APP_PRIVATE_KEY,
} from "../config/constants.js";

/**
 * Checks if a GitHub App is installed and active in a given repository.
 *
 *
 * @param {string} owner - The owner of the repository (username or organization).
 * @param {string} repo - The name of the repository.
 * @returns {Promise<Object>} A Promise that resolves to an object containing:
 *   - {boolean} installed - Indicates whether the App is installed.
 *   - {boolean} suspended - Indicates whether the App is suspended.
 *   - {number|null} installationId - The ID of the installation, or null if not installed.
 * @throws {Error} Throws an error if the request to the GitHub API fails,
 *                 except for a 404 status which indicates the App is not installed.
 */

const checkAppInstallation = async (owner, repo) => {
  const ghApp = new App({
    appId: GITHUB_APP_IDENTIFIER,
    privateKey: GITHUB_APP_PRIVATE_KEY,
  });

  try {
    const { data: installation } = await ghApp.octokit.request(
      `GET /repos/${owner}/${repo}/installation`,
      { owner, repo }
    );
    return {
      installed: true,
      suspended: installation?.suspended_by ? true : false,
      installationId: installation.id,
    };
  } catch (error) {
    if (error.status === 404) {
      return { installed: false, suspended: false, installationId: null };
    } else {
      console.error(
        `Error checking GitHub App installation for owner '${owner}' and repo '${repo}':`,
        error.message
      );
      throw error; // Re-throw other errors
    }
  }
};

/**
 * Creates an authenticated Octokit instance for a given GitHub App installation.
 *
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The repository name.
 * @returns {Promise<Octokit>} A Promise that resolves to an authenticated Octokit instance.
 * @throws {Error} - If an error occurs while obtaining the installation ID.
 */
const getOcktokitClient = async (owner, repo) => {
  try {
    const ghApp = new App({
      appId: GITHUB_APP_IDENTIFIER,
      privateKey: GITHUB_APP_PRIVATE_KEY,
    });
    const { data: installation } = await ghApp.octokit.request(
      `GET /repos/${owner}/${repo}/installation`,
      { owner, repo }
    );
    return ghApp.getInstallationOctokit(installation.id);
  } catch (error) {
    console.error(
      `Error getting Octokit client for owner '${owner}' and repo '${repo}':`,
      error.message
    );
    throw error; // Re-throw the error to propagate it to the caller.
  }
};

export const authServices = {
  getOcktokitClient,
  checkAppInstallation,
};
