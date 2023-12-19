import { PullRequestDataExtractionError } from "./customErrors.js";

/**
 * Extracts relevant data from a GitHub Pull Request from the GitHub action context.
 *
 * @returns {Object} Object containing pull request details.
 * @throws {PullRequestDataExtractionError} If data extraction fails.
 */
export const extractPullRequestData = (pr_payload) => {
  try {
    console.log(
      `Extracting data for PR #${pr_payload.number} in ${pr_payload.base.repo.owner.login}/${pr_payload.base.repo.name}`
    );

    // Return relevant PR data including user's username
    return {
      owner: pr_payload.base.repo.owner.login,
      repo: pr_payload.base.repo.name,
      branchRef: pr_payload.base.ref,
      prOwner: pr_payload.head.repo.owner.login,
      prRepo: pr_payload.head.repo.name,
      prBranchRef: pr_payload.head.ref,
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
