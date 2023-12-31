/**
 * Extracts relevant data from a GitHub Pull Request provided as a payload. This function
 * is typically used within the context of a GitHub Action to process pull request information.
 *
 * @param {Object} pr_payload - The payload object from a GitHub pull request event.
 *
 * @returns {Object} An object containing essential pull request details such as base repository owner, base 
 * repository name, base branch reference, head repository owner, head repository name, head branch reference,
 * pull request number, pull request description, and pull request link.
 *
 * @throws {PullRequestDataExtractionError} If data extraction from the payload fails, a custom error
 * `PullRequestDataExtractionError` is thrown. This helps in isolating issues specific to data extraction
 * process in the action's workflow.
 */
export const extractPullRequestData = (pr_payload) => {
  try {
    console.log(
      `Extracting data for PR #${pr_payload.number} in ${pr_payload.base.repo.owner.login}/${pr_payload.base.repo.name}`
    );

    // Return relevant PR data including user's username
    return {
      baseOwner: pr_payload.base.repo.owner.login,
      baseRepo: pr_payload.base.repo.name,
      baseBranch: pr_payload.base.ref,
      headOwner: pr_payload.head.repo.owner.login,
      headRepo: pr_payload.head.repo.name,
      headBranch: pr_payload.head.ref,
      prNumber: pr_payload.number,
      prDescription: pr_payload.body,
      prLink: pr_payload.html_url,
    };
  } catch (error) {
    console.error(`Error extracting data from pull request: ${error.message}`);
    // Throw a custom error for issues during data extraction
    throw new PullRequestDataExtractionError();
  }
};
