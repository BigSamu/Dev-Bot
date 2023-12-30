import {
  CHANGESET_PATH,
  FAILED_CHANGESET_LABEL,
  SKIP_LABEL,
} from "../config/constants.js";
import {
  getFileByPath,
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
    const changesetFilePath = `${CHANGESET_PATH}/${prNumber}.yml`;
    const changesetFile = await getFileByPath(
      headOctokit,
      headOwner,
      headRepo,
      headBranch,
      changesetFilePath
    );
    if (isSkipEntry(changesetEntriesMap)) {
      await addLabel(baseOctokit, baseOwner, baseRepo, prNumber, SKIP_LABEL);
      console.log("Skip option found. No changeset file created or updated.");
      const commitMessage = `changeset file for PR #${prNumber} deleted`;
      await deleteFileByPath(
        headOctokit,
        headOwner,
        headRepo,
        headBranch,
        changesetFilePath,
        commitMessage,
        changesetFile?.sha
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
    if (!changesetFile) {
      console.log(
        "No changeset file found. Proceding to create new changeset file..."
      );
    }
    const changesetFileContent = getChangesetFileContent(changesetEntriesMap);
    const changesetFileSha = changesetFile ? changesetFile.sha : undefined;
    const commitMessage = `changeset file for PR #${prNumber} ${
      changesetFileSha ? "updated" : "created"
    }`;
    await createOrUpdateFileByPath(
      headOctokit,
      headOwner,
      headRepo,
      headBranch,
      changesetFilePath,
      changesetFileContent,
      commitMessage,
      changesetFileSha
    );

    // Step 4 - Clean labels if exist
    await removeLabel(baseOctokit, baseOwner, baseRepo, prNumber, SKIP_LABEL);
    await removeLabel(
      baseOctokit,
      baseOwner,
      baseRepo,
      prNumber,
      FAILED_CHANGESET_LABEL
    );
  } catch (error) {
    const errorComment = formatPostComment({ input: error, type: "ERROR" });
    await postComment(baseOctokit, baseOwner, baseRepo, prNumber, errorComment);
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
