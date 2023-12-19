import { Octokit } from "octokit";

import {
  GetGithubContentError,
  CreateFileError,
  UpdateFileError,
  DeleteFileError
} from "./customErrors.js";

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
    message = `${
      sha ? "update" : "create"
    } changeset file ${prNumber}.yml for PR #${prNumber}`;
  } catch (error) {
    if (error.status === 404) {
      console.log("Changeset file not found. Proceeding to create a new one.");
    } else {
      throw new GetGithubContentError();
    }
  }

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
    throw new DeleteFileError();
  }
};
