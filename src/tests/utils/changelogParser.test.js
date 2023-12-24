import {
  processLine,
  extractChangelogEntries,
} from "../../utils/changelogParser.js";
import {
  EmptyChangelogSectionError,
  InvalidChangelogHeadingError,
} from "../../errors/index.js";

describe("Changelog Parser Tests", () => {
  describe("processLine", () => {
    test("handles the start of a comment block", () => {
      const state = { inComment: false };
      const line = "<!-- Start of comment";
      const expected = { state: { inComment: true }, line: null };
      expect(processLine(line, state)).toEqual(expected);
    });

    test("handles the end of a comment block", () => {
      const state = { inComment: true };
      const line = "End of comment -->";
      const expected = { state: { inComment: false }, line: null };
      expect(processLine(line, state)).toEqual(expected);
    });

    test("ignores line within comment blocks", () => {
      const state = { inComment: true };
      const line = "This line should be ignored";
      const expected = { state: { inComment: true }, line: null };
      expect(processLine(line, state)).toEqual(expected);
    });

    test("processes changelog line outside of comments and trims it", () => {
      const state = { inComment: false };
      const line = " a test changelog entry line ";
      const expected = {
        state: { inComment: false },
        line: "a test changelog entry line",
      };
      expect(processLine(line, state)).toEqual(expected);
    });

    test("ignores empty or whitespace-only line", () => {
      const state = { inComment: false };
      const line = "     "; // whitespace only
      const expected = { state: { inComment: false }, line: null };
      expect(processLine(line, state)).toEqual(expected);
    });
  });

  describe("extractChangelogEntries", () => {
    const mockProcessLine = jest.fn();

    beforeEach(() => {
      mockProcessLine.mockClear();
    });
    test("should throw InvalidChangelogHeadingError if `## Changelog` header is missing", () => {
      const noChangelogPRHeader =
        "A test changelog entry line\n" +
        "Another test changelog entry line\n" +
        "Yet another test changelog entry line\n" +
        "\n" +
        "## Next Heading\n";
      expect(() =>
        extractChangelogEntries(noChangelogPRHeader, mockProcessLine)
      ).toThrow(InvalidChangelogHeadingError);
      expect(mockProcessLine).not.toHaveBeenCalled();
    });

    test("should throw InvalidChangelogHeadingError if `## Changelog` header is malformed", () => {
      const malformedChangelogPRHeader =
        "## Change log\n" +
        "\n" +
        "A test changelog entry line\n" +
        "Another test changelog entry line\n" +
        "Yet another test changelog entry line\n" +
        "\n" +
        "## Next Heading\n";
      expect(() =>
        extractChangelogEntries(malformedChangelogPRHeader, mockProcessLine)
      ).toThrow(InvalidChangelogHeadingError);
      expect(mockProcessLine).not.toHaveBeenCalled();
    });

    test("should throw EmptyChangelogSectionError if `## Changelog` section is missing changelog entries", () => {
      const emptyChangelogSectionFollowedByAHeading =
        "## Changelog\n" + "\n" + "\n" + "\n" + "## Next Heading\n";
      mockProcessLine
        .mockReturnValueOnce({ state: { inComment: false }, line: null })
        .mockReturnValueOnce({ state: { inComment: false }, line: null })
        .mockReturnValueOnce({ state: { inComment: false }, line: null })
        .mockReturnValueOnce({ state: { inComment: false }, line: null })
        .mockReturnValueOnce({ state: { inComment: false }, line: null })
        .mockReturnValueOnce({ state: { inComment: false }, line: null });

      expect(() =>
        extractChangelogEntries(
          emptyChangelogSectionFollowedByAHeading,
          mockProcessLine
        )
      ).toThrow(EmptyChangelogSectionError);
      expect(mockProcessLine).toHaveBeenCalledTimes(6);
    });

    test("should convert a valid changelog section with a single entriy into an array of changelog entries", () => {
      const singleChangelogEntry =
        "## Changelog\n" +
        "\n" +
        "A single changelog entry line\n" +
        "\n" +
        "## Next Heading\n";

      mockProcessLine
        .mockReturnValueOnce({ state: { inComment: false }, line: null })
        .mockReturnValueOnce({ state: { inComment: false }, line: null })
        .mockReturnValueOnce({
          state: { inComment: false },
          line: "A single changelog entry line",
        })
        .mockReturnValueOnce({ state: { inComment: false }, line: null })
        .mockReturnValueOnce({ state: { inComment: false }, line: null });

      const expectedChangelogEntryArray = ["A single changelog entry line"];
      const actualChangelogEntryArray = extractChangelogEntries(
        singleChangelogEntry,
        mockProcessLine
      );

      expect(actualChangelogEntryArray).toEqual(expectedChangelogEntryArray);
      expect(mockProcessLine).toHaveBeenCalledTimes(5);
    });

    test("should convert a valid changelog section with many entries into an array of changelog entries", () => {
      const validChangelogSection =
        "## Changelog\n" +
        "\n" +
        "A test changelog entry line\n" +
        "Another test changelog entry line\n" +
        "Yet another test changelog entry line\n" +
        "\n" +
        "## Next Heading\n";

      mockProcessLine
        .mockReturnValueOnce({ state: { inComment: false }, line: null })
        .mockReturnValueOnce({ state: { inComment: false }, line: null })
        .mockReturnValueOnce({
          state: { inComment: false },
          line: "A test changelog entry line",
        })
        .mockReturnValueOnce({
          state: { inComment: false },
          line: "Another test changelog entry line",
        })
        .mockReturnValueOnce({
          state: { inComment: false },
          line: "Yet another test changelog entry line",
        })
        .mockReturnValueOnce({ state: { inComment: false }, line: null })
        .mockReturnValueOnce({ state: { inComment: false }, line: null });

      const expectedChangelogEntryArray = [
        "A test changelog entry line",
        "Another test changelog entry line",
        "Yet another test changelog entry line",
      ];
      const actualChangelogEntryArray = extractChangelogEntries(
        validChangelogSection,
        mockProcessLine
      );
      expect(actualChangelogEntryArray).toEqual(expectedChangelogEntryArray);
      expect(mockProcessLine).toHaveBeenCalledTimes(7);
    });

    test("should ignore text within a comment block in the changelog section", () => {
      const validChangelogSectionWithComment =
        "## Changelog\n" +
        "<!-- This is a comment\n" +
        "A line inside comment block\n" +
        "-->\n" +
        "\n" +
        "A test changelog entry line\n" +
        "Another test changelog entry line\n" +
        "Yet another test changelog entry line\n" +
        "\n" +
        "## Next Heading\n";

      mockProcessLine
        .mockReturnValueOnce({ state: { inComment: false }, line: null }) // Changelog heading
        .mockReturnValueOnce({ state: { inComment: true }, line: null }) // Start of comment block
        .mockReturnValueOnce({ state: { inComment: true }, line: null }) // Inside comment block
        .mockReturnValueOnce({ state: { inComment: true }, line: null }) // End of comment block
        .mockReturnValueOnce({ state: { inComment: false }, line: null }) // Empty line after comment block
        .mockReturnValueOnce({
          state: { inComment: false },
          line: "A test changelog entry line",
        })
        .mockReturnValueOnce({
          state: { inComment: false },
          line: "Another test changelog entry line",
        })
        .mockReturnValueOnce({
          state: { inComment: false },
          line: "Yet another test changelog entry line",
        })
        .mockReturnValueOnce({ state: { inComment: false }, line: null })
        .mockReturnValueOnce({ state: { inComment: false }, line: null });

      const expectedChangelogEntryArray = [
        "A test changelog entry line",
        "Another test changelog entry line",
        "Yet another test changelog entry line",
      ];
      const actualChangelogEntryArray = extractChangelogEntries(
        validChangelogSectionWithComment,
        mockProcessLine
      );

      expect(actualChangelogEntryArray).toEqual(expectedChangelogEntryArray);
      expect(mockProcessLine).toHaveBeenCalledTimes(10);
    });
  });
});
