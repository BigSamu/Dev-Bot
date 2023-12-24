import {
  PullRequestDataExtractionError,
  UpdatePRLabelError,
} from "../../errors/index.js";

describe("Pull Request Errors Tests", () => {
  test("PullRequestDataExtractionError default message", () => {
    const error = new PullRequestDataExtractionError();
    expect(error.message).toBe("Error extracting data from Pull Request");
    expect(error.name).toBe("PullRequestDataExtractionError");
    expect(error.shouldResultInPRComment).toBe(false);
  });

  test("UpdatePRLabelError default message", () => {
    const error = new UpdatePRLabelError();
    expect(error.message).toBe(
      "There was an error updating the label of the pull request. Please ensure the PR is accessible and the label format is correct."
    );
    expect(error.name).toBe("UpdatePRLabelError");
    expect(error.shouldResultInPRComment).toBe(false);
  });
});
