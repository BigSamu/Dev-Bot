import {
  CHANGESET_PATH,
  FAILED_CHANGESET_LABEL,
  SKIP_LABEL,
} from "../config/constants.js";

import {
  fileServices,
  labelServices,
  commentServices,
  authServices,
} from "../services/index.js";

import {
  extractPullRequestData,
  processChangelogLine,
  extractChangelogEntries,
  getChangesetEntriesMap,
  getChangesetFileContent,
  isSkipEntry,
  formatPostComment,
} from "../utils/index.js";

export const createOrUpdateChangesetFile = async (payload) => {
  let baseOwner,
    baseRepo,
    baseBranch,
    headOwner,
    headRepo,
    headBranch,
    prNumber,
    prDescription,
    prLink,
    baseOctokit,
    headOctokit;

  try {
    // Step 0 - Extract information from the payload
    ({
      baseOwner,
      baseRepo,
      baseBranch,
      headOwner,
      headRepo,
      headBranch,
      prNumber,
      prDescription,
      prLink,
    } = extractPullRequestData(payload.pull_request));

    baseOctokit = await authServices.getOcktokitClient(baseOwner, baseRepo);
    headOctokit = await authServices.getOcktokitClient(headOwner, headRepo);

    // Step 1 - Parse changelog entries and validate
    const changelogEntries = extractChangelogEntries(
      prDescription,
      processChangelogLine
    );
    const changesetEntriesMap = getChangesetEntriesMap(
      changelogEntries,
      prNumber,
      prLink
    );

    // Step 2 - Handle "skip" option

    if (isSkipEntry(changesetEntriesMap)) {
      await fileServices.addLabel(baseOctokit, baseOwner, baseRepo, prNumber, SKIP_LABEL);

      // Delete changeset file if one was previously created
      const commitMessage = `Changeset file for PR #${prNumber} deleted`;
      await fileServices.deleteFileByPath(
        headOctokit,
        headOwner,
        headRepo,
        headBranch,
        `${CHANGESET_PATH}/${prNumber}.yml`,
        commitMessage
      );

      // Clear 'failed changeset' label if exists
      await fileServices.removeLabel(
        baseOctokit,
        baseOwner,
        baseRepo,
        prNumber,
        FAILED_CHANGESET_LABEL
      );
      return;
    }

    // Step 3 - Add or update the changeset file in head repo

    const changesetFileContent = getChangesetFileContent(changesetEntriesMap);
    const commitMessage = (changesetFileSha) =>
      `Changeset file for PR #${prNumber} ${
        changesetFileSha ? "updated" : "created"
      }`;
    await fileServices.createOrUpdateFileByPath(
      headOctokit,
      headOwner,
      headRepo,
      headBranch,
      `${CHANGESET_PATH}/${prNumber}.yml`,
      changesetFileContent,
      commitMessage
    );

    // Step 4 - Remove "Skip-Changelog" and "failed changeset" labels if they exist
    await fileServices.removeLabel(baseOctokit, baseOwner, baseRepo, prNumber, SKIP_LABEL);
    await fileServices.removeLabel(
      baseOctokit,
      baseOwner,
      baseRepo,
      prNumber,
      FAILED_CHANGESET_LABEL
    );
  } catch (error) {
    
    console.error(error);
    const changesetFilePath = `${CHANGESET_PATH}/${prNumber}.yml`;

    // Delete changeset file if one was previously created
    const commitMessage = `Changeset file for PR #${prNumber} deleted`;
    await fileServices.deleteFileByPath(
      headOctokit,
      headOwner,
      headRepo,
      headBranch,
      changesetFilePath,
      commitMessage
    );

    const errorComment = formatPostComment({ input: error, type: "ERROR" });
    // Add error comment to PR
    await fileServices.postComment(baseOctokit, baseOwner, baseRepo, prNumber, errorComment);
    // Add failed changeset label
    await fileServices.addLabel(
      baseOctokit,
      baseOwner,
      baseRepo,
      prNumber,
      FAILED_CHANGESET_LABEL
    );
    // Clear skip label if exists
    await fileServices.removeLabel(baseOctokit, baseOwner, baseRepo, prNumber, SKIP_LABEL);
  }
};
