import {
  ENTRY_FORMATTING_PATTERN_REGEX,
  CHANGELOG_ENTRY_PREFIXES,
  MAX_ENTRY_LENGTH,
} from "../config/constants.js";
import {
  InvalidPrefixError,
  EntryTooLongError,
  ChangelogEntryMissingHyphenError,
  EmptyEntryDescriptionError,
} from "./customErrors.js";

/**
 * Formats a changelog entry with its associated PR number and link.
 *
 * This function checks the changelog entry for format compliance, prefix validity, and length constraints.
 * If valid, it formats the entry, capitalizes it, and links it to the provided PR.
 *
 * - If the prefix is "skip", it returns an empty string and "skip".
 * - If errors occur (like invalid prefix, empty description, entry too long, or format mismatch),
 *   corresponding custom exceptions are thrown.
 *
 * @param {string} changelogEntry - The changelog entry text to be formatted.
 * @param {string} prNumber - The PR number associated with the changelog entry.
 * @param {string} prLink - The URL link to the PR.
 * @returns {[string, string]} A tuple containing the formatted changelog entry and the identified prefix.
 * If the prefix is "skip", an empty string and the "skip" prefix are returned.
 * @throws {InvalidPrefixError} When the prefix is not included in the predefined list of valid prefixes.
 * @throws {EmptyEntryDescriptionError} When the changelog entry description is empty.
 * @throws {EntryTooLongError} When the changelog entry exceeds the maximum allowed length.
 * @throws {ChangelogEntryMissingHyphenError} When the changelog entry does not match the expected format.
 */
export const prepareChangelogEntry = (changelogEntry, prNumber, prLink) => {
  const match = changelogEntry.match(ENTRY_FORMATTING_PATTERN_REGEX);
  if (match) {
    const [, prefix, text] = match;
    const trimmedText = text ? text.trim() : "";
    if (prefix === "skip") {
      return ["", "skip"];
    } else {
      if (!CHANGELOG_ENTRY_PREFIXES.includes(prefix.toLowerCase())){
        throw new InvalidPrefixError(prefix);
      }
      else if (!text) {
        throw new EmptyEntryDescriptionError(prefix);
      } 
      else if (trimmedText.length > MAX_ENTRY_LENGTH) {
        throw new EntryTooLongError(text.length);
      }
    }
    // Capitalize the first letter of the changelog description, if it isn't already capitalized
    const capitalizedText =
      trimmedText.charAt(0).toUpperCase() + trimmedText.slice(1);
    const formattedChangelogEntry = `- ${capitalizedText} ([#${prNumber}](${prLink}))`;
    return [formattedChangelogEntry, prefix];
  } else {
    throw new ChangelogEntryMissingHyphenError();
  }
};

/**
 * Prepares a map of changelog entries categorized by their prefixes.
 * @param {string[]} entries - Array of changelog entry strings.
 * @param {number} prNumber - The pull request number associated with the entries.
 * @param {string} prLink - The link to the pull request.
 * @returns {Object} An object where keys are entry prefixes and values are arrays of associated formatted entry descriptions.
 */
export const prepareChangelogEntriesMap = (
  entries,
  prNumber,
  prLink,
  prepareChangelogEntry
) => {
  return entries
    .map((entry) => prepareChangelogEntry(entry, prNumber, prLink))
    .reduce((acc, [entry, prefix]) => {
      // Initialize the array for the prefix if it doesn't exist
      if (!acc[prefix]) {
        acc[prefix] = [];
      }
      // Add the entry to the array for the prefix
      acc[prefix].push(entry);
      return acc;
    }, {});
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
