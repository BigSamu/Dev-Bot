/**
 * Creates an authenticated Octokit instance for a given GitHub App installation.
 * This function performs asynchronous operations to obtain the installation ID and
 * then returns a Promise that resolves to an authenticated Octokit instance for that installation.
 *
 * @param {App} ghApp - The GitHub App instance.
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The repository name.
 * @returns {Promise<Octokit>} A Promise that resolves to an authenticated Octokit instance.
 */
export const getOcktokitClient = async (ghApp, owner, repo) => {
  const { data: installation } = await ghApp.octokit.request(
    `GET /repos/{owner}/{repo}/installation`,
    { owner, repo }
  );
  return ghApp.getInstallationOctokit(installation.id);
};
