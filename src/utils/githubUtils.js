import { Octokit, App } from "octokit";

import {
  PullRequestDataExtractionError,
  GetGithubContentError,
  CreateFileError,
  UpdateFileError,
  DeleteFileError,
  CategoryWithSkipOptionError,
  UpdatePRLabelError,
} from "../errors/index.js";
import { SKIP_LABEL } from "../config/constants.js";

/**
 * Extracts relevant data from a GitHub Pull Request provided as a payload. This function
 * is typically used within the context of a GitHub Action to process pull request information.
 *
 * @param {Object} pr_payload - The payload object from a GitHub pull request event.
 * @param {Object} pr_payload.base - The base object containing the target branch info.
 * @param {Object} pr_payload.head - The head object containing the source branch info.
 * @param {number} pr_payload.number - The number of the pull request.
 * @param {string} pr_payload.body - The description or body of the pull request.
 * @param {string} pr_payload.html_url - The HTML URL link to the pull request.
 *
 * @returns {Object} An object containing essential pull request details such as repository owner,
 * repository name, base branch reference, head repository owner, head repository name, head branch reference,
 * pull request number, description, and pull request link.
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

/**
 * Adds or removes a label from a GitHub pull request using Octokit instance.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {number} prNumber - Pull request number.
 * @param {string} label - Label to be added or removed.
 * @param {boolean} addLabel - Flag to add or remove the label.
 * @throws {UpdatePRLabelError} If unable to add or remove label.
 */
export const updatePRLabel = async (
  octokit,
  owner,
  repo,
  prNumber,
  label,
  addLabel
) => {
  try {
    // Get the current labels on the pull request
    const { data: currentLabels } = await octokit.rest.issues.listLabelsOnIssue(
      {
        owner,
        repo,
        issue_number: prNumber,
      }
    );

    // Check to see if the label is already on the pull request
    const labelExists = currentLabels.some((element) => element.name === label);

    if (addLabel && !labelExists) {
      // Add the label to the pull request
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: prNumber,
        labels: [label],
      });
      console.log(`Label "${label}" added to PR #${prNumber}`);
    } else if (!addLabel && labelExists) {
      // Remove the label from the pull request
      await octokit.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: prNumber,
        name: label,
      });
      console.log(`Label "${label}" removed from PR #${prNumber}`);
    } else {
      console.log(
        `Label "${label}" is already ${
          addLabel ? "present" : "absent"
        } on PR #${prNumber}. No action taken.`
      );
    }
  } catch (error) {
    console.error(
      `Error updating label "${label}" for PR #${prNumber}: ${error.message}`
    );
    throw new UpdatePRLabelError();
  }
};

/**
 * Handles a changeset entry map that contains the "skip" option.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {Object} entryMap - Map of changeset entries.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {number} prNumber - Pull request number.
 * @param {Function} updateLabel - Function to add or remove a label from a PR.
 * @throws {CategoryWithSkipOptionError} If 'skip' and other entries are present.
 */
export const handleSkipOption = async (
  octokit,
  entryMap,
  owner,
  repo,
  prNumber,
  updateLabel
) => {
  if (entryMap && Object.keys(entryMap).includes("skip")) {
    // Check if "skip" is the only prefix in the changeset entries
    if (Object.keys(entryMap).length > 1) {
      throw new CategoryWithSkipOptionError();
    } else {
      console.log("No changeset file created or updated.");
      // Adds  "skip-changelog" label in PR if not present
      await updateLabel(octokit, owner, repo, prNumber, SKIP_LABEL, true);
      // Indicates to index.js that the program should exit without creating or updating the changeset file
      return true;
    }
  }
  // Removes "skip-changelog" label in PR if present
  await updateLabel(octokit, owner, repo, prNumber, SKIP_LABEL, false);
  // Indicates to index.js that the program should proceed with creating or updating the changeset file
  return false;
};

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
 * @param {string} comment - Comment to be posted.
 */
export const postPRComment = async (
  octokit,
  owner,
  repo,
  prNumber,
  comment
) => {
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
    console.log(`No comment posted to PR #${prNumber} due to empty comment`);
  }
};

/**
 * Creates or updates a file in a GitHub repository using Octokit instance.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {string} path - File path within the repository.
 * @param {string} content - Base64 encoded content to be written to the file.
 * @param {string} message - Commit message.
 * @param {string} branchRef - Branch reference for the commit.
 * @throws {ChangesetFileAccessError} If access to the file fails.
 */
export const createOrUpdateFile = async (
  octokit,
  owner,
  repo,
  branchRef,
  prNumber,
  path,
  content
) => {
  // File's SHA to check if file exists
  let sha, message;
  // Attempt to retrieve the file's SHA to check if it exists
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branchRef,
    });
    sha = data?.sha;
  } catch (error) {
    if (error.status === 404) {
      console.log("File not found. Proceeding to create a new one.");
    } else {
      throw new GetGithubContentError();
    }
  }
  message = `${
    sha ? "update" : "create"
  } file ${prNumber}.yml for PR #${prNumber}`;
  // Create or update the changeset file content
  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content,
      sha, // If file exists, sha is used to update; otherwise, file is created
      branch: branchRef,
    });
    console.log(`File: ${path} ${sha ? "updated" : "created"} successfully.`);
  } catch (error) {
    if (!sha) {
      throw new CreateFileError();
    } else {
      throw new UpdateFileError();
    }
  }
};

/**
 * Deletes a file in a GitHub repository using an Octokit instance.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {string} path - File path within the repository.
 * @param {string} message - Commit message.
 * @param {string} branchRef - Branch reference for the commit.
 * @throws {GetGithubContentError} If retrieving the file content fails.
 * @throws {DeleteFileError} If deleting the file fails.
 */
export const deleteFile = async (
  octokit,
  owner,
  repo,
  path,
  message,
  branchRef
) => {
  let sha;

  // Retrieve the file's SHA to confirm existence
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branchRef,
    });
    sha = data?.sha;
    message = `${
      sha ? "update" : "create"
    } changeset file ${prNumber}.yml for PR #${prNumber}`;
  } catch (error) {
    throw new GetGithubContentError();
  }

  // Delete the file using its SHA
  try {
    await octokit.rest.repos.deleteFile({
      owner,
      repo,
      path,
      message,
      sha,
      branch: branchRef,
    });
    console.log(`File: ${path} deleted successfully.`);
  } catch (error) {
    throw new UpdateFileError();
  }
};

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

export const createOctokitClient = async (installationId) => {
  const appId = process.env.GITHUB_APP_IDENTIFIER;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n');

  const app = new App({ appId, privateKey });
  const installationAccessToken = await app.getInstallationAccessToken({ installationId });

  return new Octokit({ auth: installationAccessToken });
};
