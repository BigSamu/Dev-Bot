import {
  CHANGESET_PATH,
  FAILED_CHANGESET_LABEL,
  SKIP_LABEL,
} from "../config/constants.js";

import {
  createOrUpdateFileByPath,
  deleteFileByPath,
  addLabel,
  removeLabel,
  postComment,
  getOcktokitClient,
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

    baseOctokit = await getOcktokitClient(baseOwner, baseRepo);
    headOctokit = await getOcktokitClient(headOwner, headRepo);

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
      await addLabel(baseOctokit, baseOwner, baseRepo, prNumber, SKIP_LABEL);

      // Delete changeset file if one was previously created
      const commitMessage = `Changeset file for PR #${prNumber} deleted`;
      await deleteFileByPath(
        headOctokit,
        headOwner,
        headRepo,
        headBranch,
        `${CHANGESET_PATH}/${prNumber}.yml`,
        commitMessage
      );

      // Clear 'failed changeset' label if exists
      await removeLabel(
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
    const changesetFileContentEncoded = Buffer.from(
      changesetFileContent
    ).toString("base64");
    const commitMessage = (changesetFileSha) =>
      `Changeset file for PR #${prNumber} ${
        changesetFileSha ? "updated" : "created"
      }`;
    await createOrUpdateFileByPath(
      headOctokit,
      headOwner,
      headRepo,
      headBranch,
      `${CHANGESET_PATH}/${prNumber}.yml`,
      changesetFileContentEncoded,
      commitMessage
    );

    // Step 4 - Remove "Skip-Changelog" and "failed changeset" labels if they exist
    await removeLabel(baseOctokit, baseOwner, baseRepo, prNumber, SKIP_LABEL);
    await removeLabel(
      baseOctokit,
      baseOwner,
      baseRepo,
      prNumber,
      FAILED_CHANGESET_LABEL
    );
  } catch (error) {
    const changesetFilePath = `${CHANGESET_PATH}/${prNumber}.yml`;

    // Delete changeset file if one was previously created
    const commitMessage = `Changeset file for PR #${prNumber} deleted`;
    await deleteFileByPath(
      headOctokit,
      headOwner,
      headRepo,
      headBranch,
      changesetFilePath,
      commitMessage
    );

    const errorComment = formatPostComment({ input: error, type: "ERROR" });
    // Add error comment to PR
    await postComment(baseOctokit, baseOwner, baseRepo, prNumber, errorComment);
    // Add failed changeset label
    await addLabel(
      baseOctokit,
      baseOwner,
      baseRepo,
      prNumber,
      FAILED_CHANGESET_LABEL
    );
    // Clear skip label if exists
    await removeLabel(baseOctokit, baseOwner, baseRepo, prNumber, SKIP_LABEL);
  }
};
