import { MAX_ENTRY_LENGTH } from "../config/constants.js";

/**
 * Represents an error for a missing or malformed changelog heading in a PR description.
 */
export class InvalidChangelogHeadingError extends Error {
  /**
   * Constructs the InvalidChangelogHeadingError instance.
   * @param {string} [message="The '## Changelog' heading in your PR description is either missing or malformed. Please make sure that your PR description includes a '## Changelog' heading with with proper spelling, capitalization, spacing, and Markdown syntax."] - Custom error message.
   */
  constructor(
    message = "The '## Changelog' heading in your PR description is either missing or malformed. Please make sure that your PR description includes a '## Changelog' heading with proper spelling, capitalization, spacing, and Markdown syntax."
  ) {
    super(message);
    this.name = this.constructor.name;
    /**
     * Indicates whether this error should trigger a comment in the pull request.
     * @type {boolean}
     */
    this.shouldResultInPRComment = true;
  }
}

/**
 * Represents an error for an empty changelog section in a PR description.
 */
export class EmptyChangelogSectionError extends Error {
  /**
   * Constructs the EmptyChangelogSectionError instance.
   * @param {string} [message="The Changelog section in your PR description is empty. Please add a valid changelog entry or entries. If you did add a changelog entry, check to make sure that it was not accidentally included inside the comment block in the Changelog section."] - Custom error message.
   */
  constructor(
    message = "The Changelog section in your PR description is empty. Please add a valid changelog entry or entries. If you did add a changelog entry, check to make sure that it was not accidentally included inside the comment block in the Changelog section."
  ) {
    super(message);
    this.name = this.constructor.name;
    /**
     * Indicates whether this error should trigger a comment in the pull request.
     * @type {boolean}
     */
    this.shouldResultInPRComment = true;
  }
}

/**
 * Represents an error when a changelog entry exceeds the maximum allowed length.
 */
export class EntryTooLongError extends Error {
  /**
   * Constructs the EntryTooLongError instance.
   * @param {string} [entryLength] - The length of the entry provided by the user.
   */
  constructor(entryLength) {
    const characterOverage = entryLength - MAX_ENTRY_LENGTH;
    const message = `Entry is ${entryLength} characters long, which is ${characterOverage} ${
      characterOverage === 1 ? "character" : "characters"
    } longer than the maximum allowed length of ${MAX_ENTRY_LENGTH} characters. Please revise your entry to be within the maximum length.`;
    super(message);
    this.name = this.constructor.name;
    /**
     * Indicates whether this error should trigger a comment in the pull request.
     * @type {boolean}
     */
    this.shouldResultInPRComment = true;
  }
}

/**
 * Represents an error when a specified category does not exist.
 */
export class InvalidPrefixError extends Error {
  /**
   * Constructs the InvalidPrefixError instance.
   * @param {string} [foundPrefix] - The prefix provided by the user.
   */
  constructor(foundPrefix) {
    const message = `Invalid description prefix. Found "${foundPrefix}". Expected "breaking", "deprecate", "feat", "fix", "infra", "doc", "chore", "refactor", "security", "skip", or "test".`;
    super(message);
    this.name = this.constructor.name;
    /**
     * Indicates whether this error should trigger a comment in the pull request.
     * @type {boolean}
     */
    this.shouldResultInPRComment = true;
  }
}

/**
 * Represents an error when a category is incorrectly included with a 'skip' option.
 */
export class CategoryWithSkipOptionError extends Error {
  /**
   * Constructs the CategoryWithSkipError instance.
   * @param {string} [message="If your Changelog section includes the 'skip' option, it cannot also contain other changelog entries. Please revise your Changelog section."] - Custom error message.
   */
  constructor(
    message = "If your Changelog section includes the 'skip' option, it cannot also contain other changelog entries. Please revise your Changelog section."
  ) {
    super(message);
    this.name = this.constructor.name;
    /**
     * Indicates whether this error should trigger a comment in the pull request.
     * @type {boolean}
     */
    this.shouldResultInPRComment = true;
  }
}

/**
 * Represents an error when a changelog entry does not start with a '-' character.
 */
export class ChangelogEntryMissingHyphenError extends Error {
  /**
   * Constructs the ChangelogEntryMissingHyphenError instance.
   * @param {string} [message="Changelog entries must begin with a hyphen (-)."] - Custom error message.
   */
  constructor(message = "Changelog entries must begin with a hyphen (-).") {
    super(message);
    this.name = this.constructor.name;
    /**
     * Indicates whether this error should trigger a comment in the pull request.
     * @type {boolean}
     */
    this.shouldResultInPRComment = true;
  }
}

/**
 * Represents an error when a description is empty.
 */
export class EmptyEntryDescriptionError extends Error {
  /**
   * Constructs the EmptyDescriptionError instance.
   * @param {string} [foundPrefix] - The prefix provided by the user.
   */
  constructor(foundPrefix) {
    const message = `Description for "${foundPrefix}" entry cannot be empty.`;
    super(message);
    this.name = this.constructor.name;
    /**
     * Indicates whether this error should trigger a comment in the pull request.
     * @type {boolean}
     */
    this.shouldResultInPRComment = true;
  }
}
