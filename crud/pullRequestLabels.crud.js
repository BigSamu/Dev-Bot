import {
  CategoryWithSkipOptionError,
  UpdatePRLabelError,
} from "./customErrors.js";
import { SKIP_LABEL } from "../config/constants.js";

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
