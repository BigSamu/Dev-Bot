import { Octokit } from "octokit";
import {
  extractPullRequestData,
  updatePRLabel,
  handleSkipOption,
  getErrorComment,
  postPRComment,
  createOrUpdateFile,
} from "../../utils/githubUtils.js";
import {
  PullRequestDataExtractionError,
  GetGithubContentError,
  CreateFileError,
  UpdateFileError,
  UpdatePRLabelError,
  CategoryWithSkipOptionError,
} from "../../errors/index.js";
import { SKIP_LABEL } from "../../config/constants.js";

// Mock Octokit Client
jest.mock("octokit", () => {
  return {
    Octokit: jest.fn(),
  };
});

// Mock Pull Request Payload
const mockPullRequestPayload = {
  base: {
    ref: "test-base-branch",
    repo: {
      name: "test-base-repo",
      owner: {
        login: "test-owner",
      },
    },
  },
  head: {
    ref: "test-feature-branch",
    repo: {
      name: "test-forked-repo",
      owner: {
        login: "test-contributor",
      },
    },
  },
  number: "123",
  body: "Test PR body",
  html_url: "http://example.com/pr/123",
};

describe("Github Utils Tests", () => {
  const owner = mockPullRequestPayload.base.repo.owner.login;
  const repo = mockPullRequestPayload.base.repo.name;
  const branchRef = mockPullRequestPayload.base.ref;
  const prOwner = mockPullRequestPayload.head.repo.owner.login;
  const prRepo = mockPullRequestPayload.head.repo.name;
  const prBranchRef = mockPullRequestPayload.head.ref;
  const prNumber = mockPullRequestPayload.number;
  const prDescription = mockPullRequestPayload.body;
  const prLink = mockPullRequestPayload.html_url;

  const apiError = new Error("API Failure");

  describe("extractPullRequestData", () => {
    test("successfully extracts pull request data", () => {
      const expectedData = {
        owner: owner,
        repo: repo,
        branchRef: branchRef,
        prOwner: prOwner,
        prRepo: prRepo,
        prBranchRef: prBranchRef,
        prNumber: prNumber,
        prDescription: prDescription,
        prLink: prLink,
      };
      const actualData = extractPullRequestData(mockPullRequestPayload);
      expect(actualData).toEqual(expectedData);
    });

    test("throws PullRequestDataExtractionError when payload is missing required fields", () => {
      const incompletePayload = {
        base: {
          /* Missing required fields */
        },
      };
      expect(() => {
        extractPullRequestData(incompletePayload);
      }).toThrow(PullRequestDataExtractionError);
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

    beforeEach(() => {
      // Reset the mock implementations for each test
      mockAddLabels.mockClear();
      mockListLabelsOnIssue.mockClear();
      mockRemoveLabel.mockClear();
      Octokit.mockImplementation(() => octokitMock);
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

    beforeEach(() => {
      // Reset the mock implementations for each test
      mockUpdateLabel.mockClear();
      Octokit.mockImplementation(() => octokitMock);
    });

    test("calls updateLabel() with 'skip-changelog' label when 'skip' is the only entry in entryMap param", async () => {
      const entryMap = { skip: "" };
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
        true
      );
      expect(mockUpdateLabel).toHaveBeenCalledTimes(1);
    });

    test("throws CategoryWithSkipOptionError when 'skip' and other entries are present", async () => {
      const entryMap = { skip: "", other: "data" };
      await expect(
        handleSkipOption(
          octokitMock,
          entryMap,
          owner,
          repo,
          prNumber,
          mockUpdateLabel
        )
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
    const mockFormatErrorMessage = jest.fn();

    beforeEach(() => {
      // Reset the mock implementations for each test
      mockFormatErrorMessage.mockClear();
    });
    test("returns a comment string for errors that should result in a PR comment", () => {
      mockErrorInput.shouldResultInPRComment = true;
      mockFormatErrorMessage.mockReturnValueOnce(
        "TestError: Test error message formatted"
      );
      const result = getErrorComment(mockErrorInput, mockFormatErrorMessage);

      expect(mockFormatErrorMessage).toHaveBeenCalledWith(mockErrorInput);
      expect(mockFormatErrorMessage).toHaveBeenCalledTimes(1);
      expect(result).toBe("TestError: Test error message formatted");
    });

    test("returns null for errors that should not result in a PR comment", () => {
      mockErrorInput.shouldResultInPRComment = false;
      mockFormatErrorMessage.mockReturnValueOnce(
        "TestError: Test error message formatted"
      );
      const result = getErrorComment(mockErrorInput, mockFormatErrorMessage);

      expect(mockFormatErrorMessage).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("returns null for errors without a shouldResultInPRComment property", () => {
      mockFormatErrorMessage.mockReturnValueOnce(
        "TestError: Test error message formatted"
      );
      const result = getErrorComment(mockErrorInput, mockFormatErrorMessage);

      expect(mockFormatErrorMessage).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("postPRComment", () => {
    const testComment = "formatted comment string";
    const mockCreateComment = jest.fn();

    const octokitMock = {
      rest: {
        issues: {
          createComment: mockCreateComment,
        },
      },
    };

    beforeEach(() => {
      // Reset the mock implementations for each test
      mockCreateComment.mockClear();
      Octokit.mockImplementation(() => octokitMock);
    });

    test("successfully posts a comment", async () => {
      mockCreateComment.mockResolvedValueOnce({ status: 200 });
      await postPRComment(octokitMock, owner, repo, prNumber, testComment);

      expect(mockCreateComment).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number: prNumber,
        body: testComment,
      });
      expect(mockCreateComment).toHaveBeenCalledTimes(1);
    });

    test("does not post a comment when getErrorComment returns null", async () => {
      const testComment = null;
      await postPRComment(octokitMock, owner, repo, prNumber, testComment);

      expect(mockCreateComment).not.toHaveBeenCalled();
    });

    test("handles error when posting a comment fails", async () => {
      mockCreateComment.mockRejectedValueOnce(apiError);

      await postPRComment(octokitMock, owner, repo, prNumber, testComment);

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
    const filePath = "path/to/file";
    const fileContent = "Test content in file";
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

    beforeEach(() => {
      // Reset the mock implementations for each test
      mockGetContent.mockClear();
      mockCreateOrUpdateFileContents.mockClear();
      Octokit.mockImplementation(() => octokitMock);
    });

    test("creates a new changeset file when it does not exist", async () => {
      mockGetContent.mockRejectedValueOnce({ status: 404 });
      mockCreateOrUpdateFileContents.mockResolvedValueOnce({ status: 200 });
      await createOrUpdateFile(
        octokitMock,
        owner,
        repo,
        branchRef,
        prNumber,
        filePath,
        fileContent
      );

      expect(mockGetContent).toHaveBeenCalledWith({
        owner,
        repo,
        path: filePath,
        ref: branchRef,
      });
      expect(mockGetContent).toHaveBeenCalledTimes(1);
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith({
        owner,
        repo,
        path: filePath,
        message: `create file ${prNumber}.yml for PR #${prNumber}`,
        content: fileContent,
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
        branchRef,
        prNumber,
        filePath,
        fileContent
      );

      expect(mockGetContent).toHaveBeenCalledWith({
        owner,
        repo,
        path: filePath,
        ref: branchRef,
      });
      expect(mockGetContent).toHaveBeenCalledTimes(1);
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith({
        owner,
        repo,
        path: filePath,
        message: `update file ${prNumber}.yml for PR #${prNumber}`,
        content: fileContent,
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
          branchRef,
          prNumber,
          filePath,
          fileContent
        )
      ).rejects.toThrow(GetGithubContentError);
      expect(mockGetContent).toHaveBeenCalledWith({
        owner,
        repo,
        path: filePath,
        ref: branchRef,
      });
      expect(mockGetContent).toHaveBeenCalledTimes(1);
      expect(mockCreateOrUpdateFileContents).not.toHaveBeenCalled();
    });

    test("throws CreateFileError when creating a new file fails", async () => {
      mockGetContent.mockRejectedValueOnce({ status: 404 });
      mockCreateOrUpdateFileContents.mockRejectedValueOnce(apiError);

      await expect(
        createOrUpdateFile(
          octokitMock,
          owner,
          repo,
          branchRef,
          prNumber,
          filePath,
          fileContent
        )
      ).rejects.toThrow(CreateFileError);
    });

    test("throws UpdateFileError when updating an existing file fails", async () => {
      const sha = "existing-file-sha";
      mockGetContent.mockResolvedValueOnce({ data: { sha } });
      const updateError = new Error("Update failed");
      mockCreateOrUpdateFileContents.mockRejectedValueOnce(updateError);

      await expect(
        createOrUpdateFile(
          octokitMock,
          owner,
          repo,
          branchRef,
          prNumber,
          filePath,
          fileContent
        )
      ).rejects.toThrow(UpdateFileError);
    });
  });
});
