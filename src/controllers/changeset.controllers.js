import {
  CHANGESET_PATH,
  FAILED_CHANGESET_LABEL,
  SKIP_LABEL,
} from "../config/constants.js";
import {
  getFileByPath,
  getAllFilesByPath,
  createOrUpdateFileByPath,
  deleteFileByPath,
  deleteAllFilesByPath,
  addLabel,
  removeLabel,
  getOcktokitClient,
} from "../services/index.js";

import {
  extractPullRequestData,
  processChangelogLine,
  extractChangelogEntries,
  getChangesetEntriesMap,
  getChangesetFileContent,
  isSkipEntry,
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

    // Step 1 - Extract changelog entries from the PR description and return array
    const changelogEntries = extractChangelogEntries(
      prDescription,
      processChangelogLine
    );

    // Step 2 - Validate changelog entries and return a map of formatted entries
    const changesetEntriesMap = getChangesetEntriesMap(
      changelogEntries,
      prNumber,
      prLink
    );

    // Step 3 - Handle if an "skip" option exist. If it does, no changeset file is created or updated
    if (isSkipEntry(changesetEntriesMap)) {
      await addLabel(baseOctokit, baseOwner, baseRepo, prNumber, SKIP_LABEL);
      console.log("Skip option found. No changeset file created or updated.");
      return;
    }

    // Step 4 - Prepare changeset file content
    let changesetFileContent = getChangesetFileContent(changesetEntriesMap);

    // Step 5 - Add or update the changeset file in baseed baseRepo
    const changesetFilePath = `${CHANGESET_PATH}/${prNumber}.yml`;
    const changesetFile = await getFileByPath(
      headOctokit,
      headOwner,
      headRepo,
      headBranch,
      changesetFilePath
    );
    if (!changesetFile) {
      console.log(
        "No changeset file found. Proceding to create new changeset file..."
      );
    }
    const changesetFileSha = (changesetFile) ? changesetFileSha.sha : undefined;
    const commitMessage = `changeset file for PR #${prNumber} ${
      changesetFileSha ? "updated" : "created"
    }`;
    await createOrUpdateFileByPath(
      headOctokit,
      headOwner,
      headRepo,
      headBranch,
      commitMessage,
      changesetFilePath,
      changesetFileContent,
      changesetFileSha
    );

    // Step 6 - Removing Labels if exist
    // await removeLabel(baseOctokit, baseOwner, baseRepo, prNumber, SKIP_LABEL);
    // await removeLabel(
    //   baseOctokit,
    //   baseOwner,
    //   baseRepo,
    //   prNumber,
    //   FAILED_CHANGESET_LABEL
    // );
  } catch (error) {
    console.error("Error: " + error.message);
    await addLabel(
      baseOctokit,
      baseOwner,
      baseRepo,
      prNumber,
      FAILED_CHANGESET_LABEL
    );
    throw error;
  }
};
