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
  const ghApp = new App({
    id: GITHUB_APP_IDENTIFIER,
    privateKey: GITHUB_APP_PRIVATE_KEY,
  });

  try {
    const { data: installation } = await ghApp.octokit.request(
      `GET /repos/{owner}/{repo}/installation`,
      { owner, repo }
    );
    return ghApp.getInstallationOctokit(installation.id);
  } catch (error) {
    // Handle the error here, you can log it or perform any other necessary actions.
    console.error('Error in getOcktokitClient:', error);
    throw error; // Re-throw the error to propagate it to the caller.
  }
};
