/**
 * Represents an error during the extraction of data from a GitHub Pull Request.
 */
export class PullRequestDataExtractionError extends Error {
  /**
   * Constructs the PullRequestDataExtractionError instance.
   * @param {string} [message="Error extracting data from Pull Request"] - Custom error message.
   */
  constructor(message = "Error extracting data from Pull Request") {
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
 * Represents an error that occurs when updating the label of a pull request.
 */
export class UpdatePRLabelError extends Error {
  /**
   * Constructs the UpdatePRLabelError instance.
   * @param {string} [message="There was an error updating the label of the pull request. Please ensure the PR is accessible and the label format is correct."] - Custom error message.
   */
  constructor(
    message = "There was an error updating the label of the pull request. Please ensure the PR is accessible and the label format is correct."
  ) {
    super(message);
    this.name = this.constructor.name;
    /**
     * Indicates whether this error should trigger a comment in the pull request.
     * @type {boolean}
     */
    this.shouldResultInPRComment = false;
  }
}
