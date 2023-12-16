
/**
 * ****************************************************
 * I) CHANGELOG ENTRY PREFIXES
 * ****************************************************
 */

/**
 * Define the prefixes that can be used in the changelog entries.
 * @type {string[]}
 */
export const CHANGELOG_ENTRY_PREFIXES = [
  "breaking",
  "deprecate",
  "feat",
  "fix",
  "infra",
  "doc",
  "chore",
  "refactor",
  "security",
  "test",
  "skip",
];

/**
 * ****************************************************
 * II) REGEX PATTERNS
 * ****************************************************
 */

/**
 * Define regex pattern for the changelog heading.
 * @type {string}
 */
export const CHANGELOG_HEADING = "## Changelog";

/**
 * Regex pattern to capture the content of the changelog section.
 * @type {RegExp}
 */
export const CHANGELOG_SECTION_REGEX = new RegExp(
  `${CHANGELOG_HEADING}\\s*([\\s\\S]*?)(?:\\n##|$)`
);
// Explanation:
// - 'CHANGELOG_HEADING' Matches the '## Changelog' heading in markdown.
// - '\s*' matches any whitespace character following '## Changelog'.
// - '([\s\S]*?)' is a non-greedy capturing group that matches all characters, either whitespace or non-whitespace, up until the next section heading.
// - '(?:\n##|$)' is a non-capturing group that matches either a section heading or the end of the string.

/**
 * Regex pattern to match individual changelog entries in the changelog section.
 * @type {RegExp}
 */
export const ENTRY_FORMATTING_PATTERN_REGEX = new RegExp(
  `-\\s*([a-zA-Z0-9]+):?(.*)?`
);
// Explanation:
// - '-\\s*' matches a hyphen followed by any number of whitespace characters up until the first capturing group.
// - '([a-zA-Z0-9]+)' is the first capturing group, matching one or more alphanumeric characters. This portion of the regex captures the category prefix in the changelog entry.
// - ':?' matches a colon, which may or may not follow the category prefix in a changelog description (e.g., if a contributor enters '- skip')
// - '(.*)?' is the second capturing group, matching any characters following the optional colon. The '?' makes this entire group optional.

// Summary:
// For a changelog entry to be captured for processing in the script, it must begin with a hyphen (-) and at least have some alphanumeric text following. Entries that are matched by the regex will be processed and checked for errors.

/**
 * ****************************************************
 * III) OTHER CONSTANTS
 * ****************************************************
 */

/**
 * Define the maximum length of a changelog entry.
 * @type {number}
 */
export const MAX_ENTRY_LENGTH = 100;

/**
 * GitHub authentication token used for accessing the GitHub API.
 * It is expected to be set as an environment variable.
 * @type {string}
 */
export const GITHUB_TOKEN = process.env.INPUT_TOKEN;

/**
 * The file path where the changeset will be stored or updated.
 * This path is read from an environment variable.
 * @type {string}
 */
export const CHANGESET_PATH = process.env.INPUT_CHANGESET_PATH;

/**
* The label that will be added to the PR if the "skip" option is used.
* @type {string}
*/
export const SKIP_LABEL = "Skip-Changelog";

/**
* The label that will be added to the PR if the "skip" option is used.
* @type {string}
*/
export const FAILED_CHANGESET_LABEL = "failed changeset";
