/**
 * Gets a label from an issue or pull request in a GitHub repository.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {number} issueOrPullRequestNumber - Issue or pull request number.
 * @param {string} label - Label to be retrieved.
 * @returns {Promise<Object>} A Promise that resolves with the label data.
 * @throws {Error} - If an error occurs while retrieving the label.
 */
const getLabel = async (
  octokit,
  owner,
  repo,
  issueOrPullRequestNumber,
  label
) => {
  try {
    // Get the label from the issue or pull request
    const { data } = await octokit.rest.issues.getLabel({
      owner,
      repo,
      issue_number: issueOrPullRequestNumber,
      name: label,
    });

    console.log(
      `Label "${label}" retrieved from Issue/PR #${issueOrPullRequestNumber}`
    );
    return data;
  } catch (error) {
    console.error("Error retrieving label:", error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
};

/**
 * Add a label to an issue or pull request in a GitHub repository.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {number} issueOrPullRequestNumber - Issue or pull request number.
 * @param {string} label - Label to be added.
 * @returns {Promise<void>} A Promise that resolves when the label is added.
 * @throws {Error} - If an error occurs while adding the label.
 */
const addLabel = async (
  octokit,
  owner,
  repo,
  issueOrPullRequestNumber,
  label
) => {
  try {
    // Add the label to the issue or pull request
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueOrPullRequestNumber,
      labels: [label],
    });

    console.log(
      `Label "${label}" added to Issue/PR #${issueOrPullRequestNumber}`
    );
  } catch (error) {
    console.error("Error adding label:", error.message);
    throw error;
  }
};

/**
 * Remove a label from an issue or pull request in a GitHub repository.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {number} issueOrPullRequestNumber - Issue or pull request number.
 * @param {string} label - Label to be removed.
 * @returns {Promise<void>} A Promise that resolves when the label is removed.
 * @throws {Error} - If an error occurs while removing the label.
 */
const removeLabel = async (
  octokit,
  owner,
  repo,
  issueOrPullRequestNumber,
  label
) => {
  try {
    // Remove the label from the issue or pull request
    await octokit.rest.issues.removeLabel({
      owner,
      repo,
      issue_number: issueOrPullRequestNumber,
      name: label,
    });

    console.log(
      `Label "${label}" removed from Issue/PR #${issueOrPullRequestNumber}`
    );
  } catch (error) {
    if (error.status === 404) {
      console.log(`Label "${label}" not found. No need to remove label.`);
      return;
    }
    console.error("Error removing label:", error.message);
    throw error;
  }
};

export const labelServices = {
  getLabel,
  addLabel,
  removeLabel,
};
