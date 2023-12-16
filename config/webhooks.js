// Webhook handling logic
import {
  CHANGESET_PATH,
  GITHUB_TOKEN,
  FAILED_CHANGESET_LABEL,
} from "./config/constants.js";
import {
  processLine,
  extractChangelogEntries,
} from "./utils/changelogParser.js";
import {
  prepareChangelogEntry,
  prepareChangelogEntriesMap,
  prepareChangesetEntriesContent,
} from "./utils/formattingUtils.js";
import {
  extractPullRequestData,
  createOrUpdateFile,
  updatePRLabel,
  handleSkipOption,
  postPRComment,
  getErrorComment,
} from "./utils/githubUtils.js";

const setupWebhooks = (ghApp) => {
  ghApp.webhooks.on("pull_request.opened", async ({ octokit, payload }) => {
    console.log(
      `Received a pull request event for #${payload.pull_request.number}`
    );
    try {
      // Extract relevant data from the PR
      const pr = context.payload.pull_request;
      const {
        owner,
        repo,
        branchRef,
        prOwner,
        prRepo,
        prBranchRef,
        prNumber,
        prDescription,
        prLink,
      } = extractPullRequestData(pr);

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
      const message = `Add changeset for PR #${prNumber}`;

      // Create or update the changeset file using Github API
      await createOrUpdateFile(
        octokit,
        prOwner,
        prRepo,
        changesetFilePath,
        changesetEntriesContent,
        message,
        prBranchRef
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
        console.error(error);
        throw error;
      }
    }
  });

  ghApp.webhooks.onError((error) => {
    // Error handling logic
    console.error("Error handling webhook:", error);
  });
};

export default setupWebhooks;
