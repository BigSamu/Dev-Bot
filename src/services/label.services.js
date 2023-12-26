/**
 * Get information about a label in a GitHub repository.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {string} labelName - Name of the label.
 * @returns {Promise<object>} A Promise that resolves with label information.
 * @throws {Error} - If an error occurs while fetching label information.
 */
export async function getLabel(octokit, owner, repo, labelName) {
  try {
    // Get information about the label
    const { data: label } = await octokit.issues.getLabel({
      owner,
      repo,
      name: labelName,
    });

    return label;
  } catch (error) {
    console.error("Error fetching label:", error);
    throw error;
  }
}

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
export async function addLabel(
  octokit,
  owner,
  repo,
  issueOrPullRequestNumber,
  label
) {
  try {
    // Add the label to the issue or pull request
    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueOrPullRequestNumber,
      labels: [label],
    });

    console.log(
      `Label "${label}" added to Issue/PR #${issueOrPullRequestNumber}`
    );
  } catch (error) {
    console.error("Error adding label:", error);
    throw error;
  }
}

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
export async function removeLabel(
  octokit,
  owner,
  repo,
  issueOrPullRequestNumber,
  label
) {
  try {
    // Remove the label from the issue or pull request
    await octokit.issues.removeLabel({
      owner,
      repo,
      issue_number: issueOrPullRequestNumber,
      name: label,
    });

    console.log(
      `Label "${label}" removed from Issue/PR #${issueOrPullRequestNumber}`
    );
  } catch (error) {
    console.error("Error removing label:", error);
    throw error;
  }
}
