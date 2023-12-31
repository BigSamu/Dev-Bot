import { CHANGELOG_SECTION_REGEX } from "../config/constants.js";
import { EmptyChangelogSectionError, InvalidChangelogHeadingError } from "../errors/index.js";

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
  // If the line is not in a comment, contains log, and does not begin with "#" (which would indicate a section heading), consider it as part of the changelog
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
 * @param {string} prDescription - The PR description log in markdown format.
 * @param {Function} processChangelogLine - A function that processes a line from the changelog section, handling comment blocks and trimming non-comment lines.
 * @return {string[]} An array of changelog entry strings.
 */
export const extractChangelogEntries = (
  prDescription,
  processChangelogLine
) => {
  try {
    // Throw error if PR description is missing
    if(!prDescription) {
      throw new InvalidChangelogHeadingError();
    }
    // Match the changelog section using the defined regex
    const changelogSection = prDescription.match(CHANGELOG_SECTION_REGEX);
    // Output -> Array of length 2:
    // changelogSection[0]: Full regex match including '## Changelog' and following content.
    // changelogSection[1]: Captured content after '## Changelog', excluding the heading itself.
    // Throw error if '## Changelog' header is missing or malformed
    if(!changelogSection) {
      throw new InvalidChangelogHeadingError();
    }

    // Declare initial accumulator for reduce function: empty array for lines and initial state
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
    
    // Throw error if no changelog entries are found
    if(changelogEntries.length === 0) {
      throw new EmptyChangelogSectionError();
    }

    console.log(
      `Found ${changelogEntries.length} changelog ${
        changelogEntries.length === 1 ? "entry" : "entries"
      }:`
    );
    for (const eachEntry of changelogEntries){
        console.log(`${eachEntry}`);
    }
    return changelogEntries;
  } catch (error) {
    console.error("Error: " + error.message);
    throw error;
  }
};
