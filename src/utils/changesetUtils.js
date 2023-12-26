import { CHANGESET_PATH } from "../config/constants.js";
import { processChangelogLine, extractChangelogEntries } from "./changelogUtils.js";
import {
  prepareChangelogEntry,
  prepareChangelogEntriesMap,
  prepareChangesetEntriesContent,
} from "./formattingUtils.js";
import { updatePRLabel, handleSkipOption } from "./githubUtils.js";


export const getChangesetEntriesContentAndPath = async (octokit, owner, repo, prNumber, prDescription, prLink) => {
  // Create an array of changelog entry strings from the PR description
  const changelogEntries = extractChangelogEntries(prDescription, processChangelogLine);

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

  return {
    changesetEntriesContent,
    changesetFilePath,
  };
};


/**
 * Prepares the content for the changeset file.
 * @param {Object} changelogEntriesMap -  An object where keys are entry prefixes and values are arrays of associated formatted entry descriptions.
 * @returns {string} The content for the changeset file.
 */
export const prepareChangesetEntriesContent = (changelogEntriesMap) => {
  return Object.entries(changelogEntriesMap)
    .map(([prefix, entries]) => {
      return `${prefix}:\n${entries.join("\n")}`;
    })
    .join("\n\n");
};
