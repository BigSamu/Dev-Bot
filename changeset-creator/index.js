// Webhook handling logic
import {
  CHANGESET_PATH,
  FAILED_CHANGESET_LABEL }
from "../config/constants.js";
import {
  processLine,
  extractChangelogEntries,
} from "../utils/changelogParser.js";
import {
  prepareChangelogEntry,
  prepareChangelogEntriesMap,
  prepareChangesetEntriesContent,
} from "../utils/formattingUtils.js";
import {
  extractPullRequestData,
  createOrUpdateFile,
  updatePRLabel,
  handleSkipOption,
  postPRComment,
  getErrorComment,
  getOcktokitClient,
} from "../utils/githubUtils.js";

export const create_or_update_changeset = async (ghApp, octokit, payload) => {
  let owner,
    repo,
    branchRef,
    prOwner,
    prRepo,
    prBranchRef,
    prNumber,
    prDescription,
    prLink;

  try {
    // Extract relevant data from the PR
    const pr = payload.pull_request;
    ({
      owner,
      repo,
      branchRef,
      prOwner,
      prRepo,
      prBranchRef,
      prNumber,
      prDescription,
      prLink,
    } = extractPullRequestData(pr));

    // Create an array of changelog entry strings from the PR description
    const changelogEntries = extractChangelogEntries(
      prDescription,
      processLine
    );

    // Create a map of changeset entries organized by category
    const changelogEntriesMap = prepareChangelogEntriesMap(
      changelogEntries,
      prNumber,
      prLink,
      prepareChangelogEntry
    );

    // Check if the "skip" option is present in the entry map and respond accordingly
    const isSkipOptionPresent = await handleSkipOption(
      octokit,
      changelogEntriesMap,
      owner,
      repo,
      prNumber,
      updatePRLabel
    );

    // Skip changeset file creation if the "skip" label was added to the PR
    if (isSkipOptionPresent) {
      console.log("Skipping changeset creation because of 'skip' option.");
      return;
    }

    // Prepare some parameters for creating or updating the changeset file
    const changesetEntriesContent = Buffer.from(
      prepareChangesetEntriesContent(changelogEntriesMap)
    ).toString("base64");
    const changesetFileName = `${prNumber}.yml`;
    const changesetFilePath = `${CHANGESET_PATH}/${changesetFileName}`;

    const forkOwnerOcktokit = getOcktokitClient(ghApp, prOwner, prRepo);
    // Create or update the changeset file using Github API
    await createOrUpdateFile(
      forkOwnerOcktokit,
      prOwner,
      prRepo,
      prBranchRef,
      prNumber,
      changesetFilePath,
      changesetEntriesContent
    );
    await updatePRLabel(
      octokit,
      owner,
      repo,
      prNumber,
      FAILED_CHANGESET_LABEL,
      false
    );
  } catch (error) {
    if (error.response) {
      console.log(error)
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`
      );
    } else {
      if (owner && repo && prNumber) {
        await postPRComment(
          octokit,
          owner,
          repo,
          prNumber,
          error,
          getErrorComment
        );
        await updatePRLabel(
          octokit,
          owner,
          repo,
          prNumber,
          FAILED_CHANGESET_LABEL,
          true
        );
      }
    }
  }
};
