import {
  MAX_ENTRY_LENGTH,
  CHANGELOG_ENTRY_PREFIXES,
  ENTRY_FORMATTING_PATTERN_REGEX,
} from "../config/constants.js";

import {
  ChangelogEntryMissingHyphenError,
  InvalidPrefixError,
  EmptyEntryDescriptionError,
  EntryTooLongError,
  CategoryWithSkipOptionError,
} from "../errors/index.js";

/**
 * Validates and formats a set of changelog entries associated with a pull request (PR).
 *
 * This function iterates over an array of changelog entries, validating each entry against a regex pattern
 * and ensuring compliance with format, prefix validity, and length constraints. Valid entries are formatted
 * and linked to the specified PR. The function handles special cases like the "skip" prefix and throws custom
 * exceptions for various error conditions.
 *
 * - If the prefix is "skip", it immediately returns an object with an empty string associated with "skip".
 * - For valid entries, it capitalizes the log description, formats it with the PR number and link, and
 *   stores it in a map with the prefix as the key.
 * - In case of errors (invalid prefix, empty description, entry too long, format mismatch), the function
 *   throws custom exceptions.
 *
 * @param {string} changelogEntry - A changelog entry string to be validated and formatted.
 * @param {number} totalEntries - The total number of entries in the changelog section.
 * @returns {Object} - An object mapping each valid prefix to its formatted changelog entry.
 *                     If the prefix is "skip", the object will map an empty string to "skip".
 * @throws {ChangelogEntryMissingHyphenError} - When the changelog entry does not match the expected format.
 * @throws {InvalidPrefixError} - When the prefix is not included in the predefined list of valid prefixes.
 * @throws {CategoryWithSkipOptionError} - When the changelog entry contains additional category prefixes along with the "skip" option.
 * @throws {EmptyEntryDescriptionError} - When the changelog entry description is empty.
 * @throws {EntryTooLongError} - When the changelog entry exceeds the maximum allowed length.
 */
export const isValidChangelogEntry = (changelogEntry, totalEntries) => {
  const [, marker, prefix, log] = changelogEntry.match(
    ENTRY_FORMATTING_PATTERN_REGEX
  );
  const trimmedLog = log ? log.trim() : "";
  if (marker !== "-") {
    throw new ChangelogEntryMissingHyphenError();
  } else if (!CHANGELOG_ENTRY_PREFIXES.includes(prefix.toLowerCase())) {
    throw new InvalidPrefixError(prefix);
  } else if (prefix === "skip" && totalEntries > 1) {
    throw new CategoryWithSkipOptionError();
  } else if (prefix !== "skip" && !log) {
    throw new EmptyEntryDescriptionError(prefix);
  } else if (trimmedLog.length > MAX_ENTRY_LENGTH) {
    throw new EntryTooLongError(log.length);
  }
  return { prefix, trimmedLog };
};

/**
 * Handles a changeset entry map that contains the "skip" option.
 *
 * @param {Object} entryMap - Map of changeset entries.
 * @returns {Boolean} - True if the "skip" option is present in the entry map, false otherwise.
 */
export const isSkipEntry = (entryMap) => {
  if (entryMap && Object.keys(entryMap).includes("skip")) {
    console.log(
      "Skip option found. No changeset file to create or update and delete any existing one."
    );
    return true;
  } else {
    return false;
  }
};
