
import { App } from 'octokit';
import{
  GITHUB_APP_IDENTIFIER,
  GITHUB_APP_PRIVATE_KEY,
} from '../config/constants.js';
/**
 * Creates an authenticated Octokit instance for a given GitHub App installation.
 * This function performs asynchronous operations to obtain the installation ID and
 * then returns a Promise that resolves to an authenticated Octokit instance for that installation.
 *
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The repository name.
 * @returns {Promise<Octokit>} A Promise that resolves to an authenticated Octokit instance.
 * @throws {Error} - If an error occurs while obtaining the installation ID.
 */
export const getOcktokitClient = async (owner, repo) => {
  try {
    const ghApp = new App({
      appId: GITHUB_APP_IDENTIFIER,
      privateKey: GITHUB_APP_PRIVATE_KEY,
    });
    const { data: installation } = await ghApp.octokit.request(
      `GET /repos/{owner}/{repo}/installation`,
      { owner, repo }
    );
    return ghApp.getInstallationOctokit(installation.id);
  } catch (error) {
    console.error('Error in getOcktokitClient:', error.message);
    throw error; // Re-throw the error to propagate it to the caller.
  }
};
