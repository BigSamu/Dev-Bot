/**
 * Posts a comment on an issue or pull request in a GitHub repository.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {number} issueOrPullRequestNumber - Issue or pull request number.
 * @param {string} comment - Comment to be posted.
 * @returns {Promise<void>} A Promise that resolves when the comment is posted.
 * @throws {Error} - If an error occurs while posting the comment.
 */
async function postComment(octokit, owner, repo, issueOrPullRequestNumber, comment) {
  try {
    // Create the comment on the issue or pull request
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueOrPullRequestNumber,
      body: comment,
    });

    console.log(`Comment posted successfully on Issue/PR #${issueOrPullRequestNumber}`);
  } catch (error) {
    console.error("Error posting comment:", error.message);
    throw error;
  }
}

export const commentServices = {
  postComment,
}
