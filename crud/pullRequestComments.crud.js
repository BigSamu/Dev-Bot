
/**
 * Generates a comment string for a given error object based on its properties.
 *
 * @param {Error} errorInput - Error object that determines the comment to be posted.
 * @returns {string|null} - A formatted comment string if the error type merits a comment in the PR; otherwise, null.
 *
 */
export const getErrorComment = (errorInput, formatErrorMessage) => {
  if (errorInput.shouldResultInPRComment) {
    return formatErrorMessage(errorInput);
  }
  return null;
};

/**
 * Posts a comment to a GitHub pull request based on the error type using Octokit instance.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {number} prNumber - Pull request number.
 * @param {Error} errorInput - Error object that determines the comment to be posted.
 * @param {Function} getErrorComment - Function that generates a comment string for a given error object based on its properties.
 */
export const postPRComment = async (
  octokit,
  owner,
  repo,
  prNumber,
  errorInput,
  getErrorComment,
  formatErrorMessage
) => {
  const comment = getErrorComment(errorInput, formatErrorMessage);

  if (comment) {
    try {
      // Post a comment to the pull request
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: comment,
      });
      console.log(`Comment posted to PR #${prNumber}: "${comment}"`);
    } catch (error) {
      console.error(
        `Error posting comment to PR #${prNumber}: ${error.message}`
      );
    }
  } else {
    console.log(
      `No comment posted to PR #${prNumber} due to error type: ${errorInput.name}`
    );
  }
};
