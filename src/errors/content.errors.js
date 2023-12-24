/**
 * Represents an error during the retrieval of content from a GitHub repository.
 */
export class GetGithubContentError extends Error {
  /**
   * Constructs the GetGithubContentError instance.
   * @param {string} [message="Error retrieving content from GitHub"] - Custom error message.
   */
  constructor(message = "Error retrieving content from GitHub repository") {
    super(message);
    this.name = this.constructor.name;
    /**
     * Indicates whether this error should trigger a comment in the pull request.
     * @type {boolean}
     */
    this.shouldResultInPRComment = false;
  }
}

/**
 * Represents an error during the creation of a file in a GitHub repository.
 */
export class CreateFileError extends Error {
  /**
   * Constructs the CreateChangesetFileError instance.
   * @param {string} [message="Error creating file in repository"] - Custom error message.
   */
  constructor(message = "Error creating file in repository") {
    super(message);
    this.name = this.constructor.name;
    /**
     * Indicates whether this error should trigger a comment in the pull request.
     * @type {boolean}
     */
    this.shouldResultInPRComment = false;
  }
}

/**
 * Represents an error during the update of a file in a GitHub repository.
 */
export class UpdateFileError extends Error {
  /**
   * Constructs the UpdateFileError instance.
   * @param {string} [message="Error updating file in repository"] - Custom error message.
   */
  constructor(message = "Error updating file in repository") {
    super(message);
    this.name = this.constructor.name;
    /**
     * Indicates whether this error should trigger a comment in the pull request.
     * @type {boolean}
     */
    this.shouldResultInPRComment = false;
  }
}

/**
 * Represents an error during the deletion of a file in a GitHub repository.
 */
export class DeleteFileError extends Error {
  /**
   * Constructs the DeleteFileError instance.
   * @param {string} [message="Error deleting file in repository"] - Custom error message.
   */
  constructor(message = "Error deleting file in repository") {
    super(message);
    this.name = this.constructor.name;
    /**
     * Indicates whether this error should trigger a comment in the pull request.
     * @type {boolean}
     */
    this.shouldResultInPRComment = false;
  }
}
