import github from "@actions/github";
import {
  extractPullRequestData,
  updatePRLabel,
  handleSkipOption,
  getErrorComment,
  postPRComment,
  createOrUpdateFile,
} from "../utils/githubUtils.js";
import {
  PullRequestDataExtractionError,
  GetGithubContentError,
  CreateChangesetFileError,
  UpdateChangesetFileError,
  UpdatePRLabelError,
  CategoryWithSkipOptionError,
} from "../utils/customErrors.js";
import { SKIP_LABEL } from "../config/constants";

// Mock the @actions/github module
jest.mock("@actions/github", () => ({
  getOctokit: jest.fn(),
  context: {
    repo: {
      owner: "testOwner",
      repo: "testRepo",
    },
    payload: {
      pull_request: {
        number: 123,
        head: {
          ref: "testBranch",
        },
      },
    },
  },
}));

describe("Github Utils Tests", () => {
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const prNumber = github.context.payload.pull_request.number;
  const branchRef = github.context.payload.pull_request.head.ref;

  const apiError = new Error("API Failure");

  describe("extractPullRequestData", () => {
    const mockPullsGet = jest.fn();
    const octokitMock = {
      rest: {
        pulls: {
          get: mockPullsGet,
        },
      },
    };

    beforeAll(() => {
      github.getOctokit.mockImplementation(() => octokitMock);
    });
    beforeEach(() => {
      github.getOctokit.mockClear();
    });

    test("successfully extracts pull request data", async () => {
      const mockPRData = {
        data: {
          body: "Test PR body",
          html_url: "http://example.com/pr/123",
        },
      };
      mockPullsGet.mockResolvedValueOnce(mockPRData);
      const expectedData = {
        owner: "testOwner",
        repo: "testRepo",
        prNumber: 123,
        prDescription: mockPRData.data.body,
        prLink: mockPRData.data.html_url,
        branchRef: "testBranch",
      };
      const actualData = await extractPullRequestData(octokitMock);
      expect(actualData).toEqual(expectedData);
      expect(mockPullsGet).toHaveBeenCalledWith({
        owner: expectedData.owner,
        repo: expectedData.repo,
        pull_number: expectedData.prNumber,
      });
      expect(mockPullsGet).toHaveBeenCalledTimes(1);
    });

    test("throws PullRequestDataExtractionError on API failure", async () => {
      mockPullsGet.mockRejectedValueOnce(apiError);
      await expect(extractPullRequestData(octokitMock)).rejects.toThrow(
        PullRequestDataExtractionError
      );
      expect(mockPullsGet).toHaveBeenCalledTimes(1);
    });

    test.each([
      [null, "null response"],
      [undefined, "undefined response"],
      ["not-an-object", "non-object response"],
    ])("throws error for %s data", async (response, description) => {
      mockPullsGet.mockResolvedValueOnce({ data: response });
      await expect(extractPullRequestData(octokitMock)).rejects.toThrow(
        PullRequestDataExtractionError
      );
    });

    test.each([
      [undefined, "undefined response"],
      [null, "null response"],
      [{ data: {} }, "empty data field"],
    ])(
      "throws error for %s response from API",
      async (resolvedValue, description) => {
        mockPullsGet.mockResolvedValueOnce(resolvedValue);
        await expect(extractPullRequestData(octokitMock)).rejects.toThrow(
          PullRequestDataExtractionError
        );
      }
    );

    test("throws error for incomplete response data", async () => {
      // Simulating missing 'body' in the response
      const incompleteData = {
        data: {
          html_url: "http://example.com/pr",
        },
      };
      mockPullsGet.mockResolvedValueOnce(incompleteData);
      await expect(extractPullRequestData(octokitMock)).rejects.toThrow(
        PullRequestDataExtractionError
      );
    });
  });

  describe("updatePRLabel", () => {
    const label = "test-label";
    const mockAddLabels = jest.fn();
    const mockListLabelsOnIssue = jest.fn();
    const mockRemoveLabel = jest.fn();

    const octokitMock = {
      rest: {
        issues: {
          addLabels: mockAddLabels,
          listLabelsOnIssue: mockListLabelsOnIssue,
          removeLabel: mockRemoveLabel,
        },
      },
    };

    beforeAll(() => {
      github.getOctokit.mockImplementation(() => octokitMock);
    });
    beforeEach(() => {
      github.getOctokit.mockClear();
    });

    test("successfully adds a label when it doesn't exist", async () => {
      mockListLabelsOnIssue.mockResolvedValue({ data: [] });
      await updatePRLabel(octokitMock, owner, repo, prNumber, label, true);

      expect(mockListLabelsOnIssue).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
      });
      expect(mockListLabelsOnIssue).toHaveBeenCalledTimes(1);
      expect(mockAddLabels).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
        labels: [label],
      });
      expect(mockAddLabels).toHaveBeenCalledTimes(1);
      expect(mockRemoveLabel).not.toHaveBeenCalled();
    });

    test("successfully removes an existing label", async () => {
      mockListLabelsOnIssue.mockResolvedValue({ data: [{ name: label }] });
      await updatePRLabel(octokitMock, owner, repo, prNumber, label, false);

      expect(mockListLabelsOnIssue).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
      });
      expect(mockListLabelsOnIssue).toHaveBeenCalledTimes(1);
      expect(mockAddLabels).not.toHaveBeenCalled();
      expect(mockRemoveLabel).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
        name: label,
      });
      expect(mockRemoveLabel).toHaveBeenCalledTimes(1);
    });

    test("tries to add a label that is present", async () => {
      mockListLabelsOnIssue.mockResolvedValue({ data: [{ name: label }] });
      await updatePRLabel(octokitMock, owner, repo, prNumber, label, true);

      expect(mockListLabelsOnIssue).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
      });
      expect(mockListLabelsOnIssue).toHaveBeenCalledTimes(1);
      expect(mockAddLabels).not.toHaveBeenCalled();
      expect(mockRemoveLabel).not.toHaveBeenCalled();
    });
    test("tries to remove a label that isn't present", async () => {
      mockListLabelsOnIssue.mockResolvedValue({ data: [] });
      await updatePRLabel(octokitMock, owner, repo, prNumber, label, false);

      expect(mockListLabelsOnIssue).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
      });
      expect(mockListLabelsOnIssue).toHaveBeenCalledTimes(1);
      expect(mockAddLabels).not.toHaveBeenCalled();
      expect(mockRemoveLabel).not.toHaveBeenCalled();
    });

    test("throws an error when adding a label fails", async () => {
      mockListLabelsOnIssue.mockResolvedValue({ data: [] });
      mockAddLabels.mockRejectedValueOnce(apiError);
      await expect(
        updatePRLabel(octokitMock, owner, repo, prNumber, label, true)
      ).rejects.toThrow(UpdatePRLabelError);

      expect(mockListLabelsOnIssue).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
      });
      expect(mockListLabelsOnIssue).toHaveBeenCalledTimes(1);
      expect(mockAddLabels).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
        labels: [label],
      });
      expect(mockAddLabels).toHaveBeenCalledTimes(1);
      expect(mockRemoveLabel).not.toHaveBeenCalled();
    });

    test("throws an error when checking labels fails", async () => {
      mockListLabelsOnIssue.mockRejectedValueOnce(apiError);
      await expect(
        updatePRLabel(octokitMock, owner, repo, prNumber, label, false)
      ).rejects.toThrow(UpdatePRLabelError);

      expect(mockListLabelsOnIssue).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
      });
      expect(mockListLabelsOnIssue).toHaveBeenCalledTimes(1);
      expect(mockAddLabels).not.toHaveBeenCalled();
      expect(mockRemoveLabel).not.toHaveBeenCalled();
    });

    test("throws an error when removing a label fails", async () => {
      mockListLabelsOnIssue.mockResolvedValue({ data: [{ name: label }] });
      mockRemoveLabel.mockRejectedValueOnce(apiError);
      await expect(
        updatePRLabel(octokitMock, owner, repo, prNumber, label, false)
      ).rejects.toThrow(UpdatePRLabelError);

      expect(mockListLabelsOnIssue).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
      });
      expect(mockListLabelsOnIssue).toHaveBeenCalledTimes(1);
      expect(mockAddLabels).not.toHaveBeenCalled();
      expect(mockRemoveLabel).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
        name: label,
      });
      expect(mockRemoveLabel).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleSkipOption Tests", () => {
    const mockUpdateLabel = jest.fn();
    const octokitMock = jest.fn();

    beforeAll(() => {
      github.getOctokit.mockImplementation(() => octokitMock);
    })
    beforeEach(() => {
      github.getOctokit.mockClear();
      mockUpdateLabel.mockClear();
    });

    test("calls updateLabel() with 'skip-changelog' label when 'skip' is the only entry in entryMap param", async () => {
      const entryMap = { skip: "" };
      await handleSkipOption(octokitMock, entryMap, owner, repo, prNumber, mockUpdateLabel);

      expect(mockUpdateLabel).toHaveBeenCalledWith(
        octokitMock,
        owner,
        repo,
        prNumber,
        SKIP_LABEL,
        true
      );
      expect(mockUpdateLabel).toHaveBeenCalledTimes(1);
    });

    test("throws CategoryWithSkipOptionError when 'skip' and other entries are present", async () => {
      const entryMap = { skip: "", other: "data" };
      await expect(
        handleSkipOption(octokitMock, entryMap, owner, repo, prNumber, mockUpdateLabel)
      ).rejects.toThrow(CategoryWithSkipOptionError);

      expect(mockUpdateLabel).not.toHaveBeenCalled();
    });

    test.each([
      [null, "null entryMap"],
      [undefined, "undefined entryMap"],
      [{}, "empty entryMap"],
    ])(
      "calls updateLabel() with 'skip-changelog' label when entry is %s",
      async (entryMap, description) => {
        await handleSkipOption(
          octokitMock,
          entryMap,
          owner,
          repo,
          prNumber,
          mockUpdateLabel
        );

        expect(mockUpdateLabel).toHaveBeenCalledWith(
          octokitMock,
          owner,
          repo,
          prNumber,
          SKIP_LABEL,
          false
        );
        expect(mockUpdateLabel).toHaveBeenCalledTimes(1);
      }
    );
  });

  describe("getErrorComment", () => {
    const mockErrorInput = new Error("Test error message");
    mockErrorInput.name = "TestError";
    test("returns a comment string for errors that should result in a PR comment", () => {
      mockErrorInput.shouldResultInPRComment = true;
      const result = getErrorComment(mockErrorInput);
      expect(result).toBe("TestError: Test error message");
    });

    test("returns null for errors that should not result in a PR comment", () => {
      mockErrorInput.shouldResultInPRComment = false;
      const result = getErrorComment(mockErrorInput);
      expect(result).toBeNull();
    });

    test("returns null for errors without a shouldResultInPRComment property", () => {
      const result = getErrorComment(mockErrorInput);
      expect(result).toBeNull();
    });
  });

  describe("postPRComment", () => {
    const mockErrorInput = new Error("Test error message");
    const testComment = "formatted comment string";
    const mockGetErrorComment = jest.fn();
    const mockCreateComment = jest.fn();

    const octokitMock = {
      rest: {
        issues: {
          createComment: mockCreateComment,
        },
      },
    };

    beforeAll(() => {
      github.getOctokit.mockImplementation(() => octokitMock);
    });
    beforeEach(() => {
      mockGetErrorComment.mockClear();
      github.getOctokit.mockClear();
    });

    test("successfully posts a comment", async () => {
      mockGetErrorComment.mockReturnValueOnce(testComment);
      mockCreateComment.mockResolvedValueOnce({ status: 200 });
      await postPRComment(
        octokitMock,
        owner,
        repo,
        prNumber,
        mockErrorInput,
        mockGetErrorComment
      );

      expect(mockGetErrorComment).toHaveBeenCalledWith(mockErrorInput);
      expect(mockGetErrorComment).toHaveBeenCalledTimes(1);
      expect(mockCreateComment).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
        body: testComment,
      });
      expect(mockCreateComment).toHaveBeenCalledTimes(1);
    });

    test("does not post a comment when getErrorComment returns null", async () => {
      mockGetErrorComment.mockReturnValueOnce(null);
      await postPRComment(
        octokitMock,
        owner,
        repo,
        prNumber,
        mockErrorInput,
        mockGetErrorComment
      );
      expect(mockGetErrorComment).toHaveBeenCalledWith(mockErrorInput);
      expect(mockGetErrorComment).toHaveBeenCalledTimes(1);
      expect(mockCreateComment).not.toHaveBeenCalled();
    });

    test("handles error when posting a comment fails", async () => {
      mockGetErrorComment.mockReturnValueOnce(testComment);
      mockCreateComment.mockRejectedValueOnce(apiError);

      await postPRComment(
        octokitMock,
        owner,
        repo,
        prNumber,
        mockErrorInput,
        mockGetErrorComment
      );
      expect(mockGetErrorComment).toHaveBeenCalledWith(mockErrorInput);
      expect(mockGetErrorComment).toHaveBeenCalledTimes(1);
      expect(mockCreateComment).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
        body: testComment,
      });
      expect(mockCreateComment).toHaveBeenCalledTimes(1);
    });
  });

  describe("createOrUpdateFile", () => {
    const changesetFilePath = "test/path/changesets/directory";
    const changesetFileContent = "Changeset test content";
    const changesetCommitMessage = "Changeset commit message";
    const mockGetContent = jest.fn();
    const mockCreateOrUpdateFileContents = jest.fn();

    const octokitMock = {
      rest: {
        repos: {
          getContent: mockGetContent,
          createOrUpdateFileContents: mockCreateOrUpdateFileContents,
        },
      },
    };

    beforeAll(() => {
      github.getOctokit.mockImplementation(() => octokitMock);
    });
    beforeEach(() => {
      github.getOctokit.mockClear();
    });

    test("creates a new changeset file when it does not exist", async () => {
      mockGetContent.mockRejectedValueOnce({ status: 404 });
      mockCreateOrUpdateFileContents.mockResolvedValueOnce({ status: 200 });
      await createOrUpdateFile(
        octokitMock,
        owner,
        repo,
        changesetFilePath,
        changesetFileContent,
        changesetCommitMessage,
        branchRef
      );

      expect(mockGetContent).toHaveBeenCalledWith({
        owner,
        repo,
        path: changesetFilePath,
        ref: branchRef,
      });
      expect(mockGetContent).toHaveBeenCalledTimes(1);
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith({
        owner,
        repo,
        path: changesetFilePath,
        message: changesetCommitMessage,
        content: changesetFileContent,
        sha: undefined,
        branch: branchRef,
      });
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledTimes(1);
    });

    test("updates an existing file", async () => {
      const sha = "existing-file-sha";
      mockGetContent.mockResolvedValueOnce({ data: { sha } });
      mockCreateOrUpdateFileContents.mockResolvedValueOnce({ status: 200 });

      await createOrUpdateFile(
        octokitMock,
        owner,
        repo,
        changesetFilePath,
        changesetFileContent,
        changesetCommitMessage,
        branchRef
      );

      expect(mockGetContent).toHaveBeenCalledWith({
        owner,
        repo,
        path: changesetFilePath,
        ref: branchRef,
      });
      expect(mockGetContent).toHaveBeenCalledTimes(1);
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith({
        owner,
        repo,
        path: changesetFilePath,
        message: changesetCommitMessage,
        content: changesetFileContent,
        sha,
        branch: branchRef,
      });
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledTimes(1);
    });

    test("throws an error when file access fails with a non-404 error", async () => {
      const error = new Error("API Failure with non-404 Error");
      error.status = 500;
      mockGetContent.mockRejectedValueOnce(error);

      await expect(
        createOrUpdateFile(
          octokitMock,
          owner,
          repo,
          changesetFilePath,
          changesetFileContent,
          changesetCommitMessage,
          branchRef
        )
      ).rejects.toThrow(GetGithubContentError);
      expect(mockGetContent).toHaveBeenCalledWith({
        owner,
        repo,
        path: changesetFilePath,
        ref: branchRef,
      });
      expect(mockGetContent).toHaveBeenCalledTimes(1);
      expect(mockCreateOrUpdateFileContents).not.toHaveBeenCalled();
    });

    test("throws CreateChangesetFileError when creating a new file fails", async () => {
      mockGetContent.mockRejectedValueOnce({ status: 404 });
      mockCreateOrUpdateFileContents.mockRejectedValueOnce(apiError);

      await expect(
        createOrUpdateFile(
          octokitMock,
          owner,
          repo,
          changesetFilePath,
          changesetFileContent,
          changesetCommitMessage,
          branchRef
        )
      ).rejects.toThrow(CreateChangesetFileError);
    });

    test("throws UpdateChangesetFileError when updating an existing file fails", async () => {
      const sha = "existing-file-sha";
      mockGetContent.mockResolvedValueOnce({ data: { sha } });
      const updateError = new Error("Update failed");
      mockCreateOrUpdateFileContents.mockRejectedValueOnce(updateError);

      await expect(
        createOrUpdateFile(
          octokitMock,
          owner,
          repo,
          changesetFilePath,
          changesetFileContent,
          changesetCommitMessage,
          branchRef
        )
      ).rejects.toThrow(UpdateChangesetFileError);
    });
  });
});
