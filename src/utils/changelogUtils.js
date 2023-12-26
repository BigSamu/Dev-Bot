
import {
  CHANGELOG_SECTION_REGEX,
  ENTRY_FORMATTING_PATTERN_REGEX,
  CHANGELOG_ENTRY_PREFIXES,
  MAX_ENTRY_LENGTH,
} from "../config/constants.js";
import {
  InvalidChangelogHeadingError,
  EmptyChangelogSectionError,
  InvalidPrefixError,
  EntryTooLongError,
  ChangelogEntryMissingHyphenError,
  EmptyEntryDescriptionError,
} from "../errors/index.js";

/**
 * Processes a line from a changelog section, handling comment blocks and trimming non-comment lines.
 * Lines inside comments or empty are ignored (set to null).
 *
 * @param {string} line - A line from the changelog section.
 * @param {Object} state - The current parsing state, including whether inside a comment block.
 * @returns {Object} An object with the updated parsing state and the processed line (null for ignored lines, trimmed otherwise).
 */
export const processChangelogLine = (line, state) => {
  // Check for the start of a comment block
  if (line.includes("<!--"))
    return {
      state: { ...state, inComment: true },
      line: null,
    };

  // Check for the end of a comment block
  if (line.includes("-->"))
    return {
      state: { ...state, inComment: false },
      line: null,
    };

  const trimmedLine = line.trim();
  // If the line is not in a comment, contains text, and does not begin with "#" (which would indicate a section heading), consider it as part of the changelog
  if (
    !state.inComment &&
    trimmedLine.length > 0 &&
    !trimmedLine.startsWith("#")
  )
    return { state, line: trimmedLine };

  // For lines within comments or empty lines, return null
  return { state, line: null };
};

/**
 * Extracts changelog entries from a PR description.
 * @param {string} prDescription - The PR description text in markdown format.
 * @param {Function} processChangelogLine - A function that processes a line from the changelog section, handling comment blocks and trimming non-comment lines.
 * @return {string[]} An array of changelog entry strings.
 */
export const extractChangelogEntries = (prDescription, processChangelogLine) => {
  // Match the changelog section using the defined regex
  const changelogSection = prDescription.match(CHANGELOG_SECTION_REGEX);
  // Output -> Array of length 2:
  // changelogSection[0]: Full regex match including '## Changelog' and following content.
  // changelogSection[1]: Captured content after '## Changelog', excluding the heading itself.
  // Throw error if '## Changelog' header is missing or malformed
  if (!changelogSection) {
    throw new InvalidChangelogHeadingError();
  }

  // Initial accumulator for reduce: empty array for lines and initial state
  const initialAcc = { entries: [], state: { inComment: false } };

  // Process each line and filter out valid changelog entries
  const changelogEntries = changelogSection[0]
    .split("\n")
    .reduce((acc, line) => {
      const { entries, state } = acc;
      const processed = processChangelogLine(line, state);
      if (processed.line) entries.push(processed.line.trim());
      return { entries, state: processed.state };
    }, initialAcc).entries;

  if (changelogEntries.length === 0) {
    throw new EmptyChangelogSectionError();
  }

  console.log(
    `Found ${changelogEntries.length} changelog ${
      changelogEntries.length === 1 ? "entry" : "entries"
    }.`
  );
  console.log(changelogEntries);

  return changelogEntries;
};

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
      if (!CHANGELOG_ENTRY_PREFIXES.includes(prefix.toLowerCase())) {
        throw new InvalidPrefixError(prefix);
      } else if (!text) {
        throw new EmptyEntryDescriptionError(prefix);
      } else if (trimmedText.length > MAX_ENTRY_LENGTH) {
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
