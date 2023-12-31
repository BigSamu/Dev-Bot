import {
  GetGithubContentError,
  CreateFileError,
  UpdateFileError,
} from "../../errors/index.js";

describe("Content Errors Tests", () => {
  test("GetGithubContentError default message", () => {
    const error = new GetGithubContentError();
    expect(error.message).toBe(
      "Error retrieving content from GitHub repository"
    );
    expect(error.name).toBe("GetGithubContentError");
    expect(error.shouldResultInPRComment).toBe(false);
  });

  test("CreateFileError default message", () => {
    const error = new CreateFileError();
    expect(error.message).toBe("Error creating file in repository");
    expect(error.name).toBe("CreateFileError");
    expect(error.shouldResultInPRComment).toBe(false);
  });

  test("UpdateFileError default message", () => {
    const error = new UpdateFileError();
    expect(error.message).toBe("Error updating file in repository");
    expect(error.name).toBe("UpdateFileError");
    expect(error.shouldResultInPRComment).toBe(false);
  });
});
