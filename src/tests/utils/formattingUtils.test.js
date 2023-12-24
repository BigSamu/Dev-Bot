import {
  CHANGELOG_ENTRY_PREFIXES,
  MAX_ENTRY_LENGTH,
} from "../../config/constants.js";
import {
  prepareChangelogEntry,
  prepareChangelogEntriesMap,
  prepareChangesetEntriesContent,
} from "../../utils/formattingUtils.js";
import {
  InvalidPrefixError,
  EmptyEntryDescriptionError,
  EntryTooLongError,
  ChangelogEntryMissingHyphenError,
} from "../../errors/index.js";

describe("Formatting Utils Tests", () => {
  const prNumber = 123;
  const prLink = `http://example.com/pr/${prNumber}`;

  describe("prepareChangelogEntry", () => {
    const descriptionText = "test description";
    test.each(CHANGELOG_ENTRY_PREFIXES)(
      `correctly prepare formatted changelog entry for "%s" prefix`,
      (prefix) => {
        const entry = `- ${prefix}: ${descriptionText}`;
        const [formattedEntry, returnedPrefix] = prepareChangelogEntry(
          entry,
          prNumber,
          prLink
        );

        const expectedOutput =
          prefix === "skip"
            ? ""
            : `- ${
                descriptionText.charAt(0).toUpperCase() +
                descriptionText.slice(1)
              } ([#${prNumber}](${prLink}))`;

        expect(formattedEntry).toEqual(expectedOutput);
        expect(returnedPrefix).toEqual(prefix);
        // Check capitalization of the first letter of formattedEntry
        if (prefix !== "skip") {
          expect(formattedEntry.charAt(2)).toEqual(
            descriptionText.charAt(0).toUpperCase()
          );
        }
      }
    );

    test("with invalid prefix, should throw InvalidPrefixError", () => {
      const invalidPrefix = "invalid";
      const invalidEntry = `- ${invalidPrefix}: This is an invalid prefix`;
      const expectedErrorMessage = `Invalid description prefix. Found "${invalidPrefix}". Expected "breaking", "deprecate", "feat", "fix", "infra", "doc", "chore", "refactor", "security", "skip", or "test".`;

      expect(() => {
        prepareChangelogEntry(invalidEntry, prNumber, prLink);
      }).toThrow(InvalidPrefixError);
      expect(() => {
        prepareChangelogEntry(invalidEntry, prNumber, prLink);
      }).toThrow(expectedErrorMessage);
    });

    test("with empty entry description, should throw EmptyEntryDescriptionError", () => {
      const emptyDescriptionEntry = "- feat:";
      expect(() => {
        prepareChangelogEntry(emptyDescriptionEntry, prNumber, prLink);
      }).toThrow(EmptyEntryDescriptionError);
    });

    test("with entry too long, should throw EntryTooLongError", () => {
      const longEntryText =
        " a very long entry with too much text that exceeds the maximum allowed length limit specified for for a changelog entry";
      const longEntry = `- feat:${longEntryText}`;
      const characterOverage = longEntryText.length - MAX_ENTRY_LENGTH;
      const expectedErrorMessage = `Entry is ${
        longEntryText.length
      } characters long, which is ${characterOverage} ${
        characterOverage === 1 ? "character" : "characters"
      } longer than the maximum allowed length of ${MAX_ENTRY_LENGTH} characters.`;

      expect(() => {
        prepareChangelogEntry(longEntry, prNumber, prLink);
      }).toThrow(EntryTooLongError);
      expect(() => {
        prepareChangelogEntry(longEntry, prNumber, prLink);
      }).toThrow(expectedErrorMessage);
    });

    test("with entry missing hyphen, should throw ChangelogEntryMissingHyphenError", () => {
      const noHyphenEntry = "feat: Missing hyphen at start";
      expect(() => {
        prepareChangelogEntry(noHyphenEntry, prNumber, prLink);
      }).toThrow(ChangelogEntryMissingHyphenError);
    });
  });

  describe("prepareChangelogEntriesMap", () => {
    const mockPrepareChangelogEntry = jest.fn();

    beforeEach(() => {
      mockPrepareChangelogEntry.mockClear();
    });

    test("correctly maps entries array to their prefixes considering one entry", () => {
      const entries = ["- prefix_1: Some sample text"];
      mockPrepareChangelogEntry.mockReturnValueOnce([
        "Some sample text formatted",
        "prefix_1",
      ]);

      const result = prepareChangelogEntriesMap(
        entries,
        prNumber,
        prLink,
        mockPrepareChangelogEntry
      );

      expect(result).toEqual({
        prefix_1: ["Some sample text formatted"],
      });
      expect(mockPrepareChangelogEntry).toHaveBeenCalledTimes(1);
      expect(mockPrepareChangelogEntry).toHaveBeenCalledWith(
        entries[0],
        prNumber,
        prLink
      );
    });

    test("correctly maps entries array to their prefixes considering more than one entry all with different prefixes", () => {
      const entries = [
        "- prefix_1: Some sample text",
        "- prefix_2: Other sample text",
        "- prefix_3: New sample text",
      ];
      mockPrepareChangelogEntry
        .mockReturnValueOnce(["Some sample text formatted", "prefix_1"])
        .mockReturnValueOnce(["Other sample text formatted", "prefix_2"])
        .mockReturnValueOnce(["New sample text formatted", "prefix_3"]);

      const result = prepareChangelogEntriesMap(
        entries,
        prNumber,
        prLink,
        mockPrepareChangelogEntry
      );
      expect(result).toEqual({
        prefix_1: ["Some sample text formatted"],
        prefix_2: ["Other sample text formatted"],
        prefix_3: ["New sample text formatted"],
      });
      expect(mockPrepareChangelogEntry).toHaveBeenCalledTimes(entries.length);
      entries.forEach((entry) => {
        expect(mockPrepareChangelogEntry).toHaveBeenCalledWith(
          entry,
          prNumber,
          prLink
        );
      });
    });

    test("correctly maps entries array to their prefixes considering more than one entry with at least two of them with same prefix", () => {
      const entries = [
        "- prefix_1: Some sample text",
        "- prefix_1: Other sample text",
        "- prefix_2: New sample text",
      ];
      mockPrepareChangelogEntry
        .mockReturnValueOnce(["Some sample text formatted", "prefix_1"])
        .mockReturnValueOnce(["Other sample text formatted", "prefix_1"])
        .mockReturnValueOnce(["New sample text formatted", "prefix_2"]);

      const result = prepareChangelogEntriesMap(
        entries,
        prNumber,
        prLink,
        mockPrepareChangelogEntry
      );
      expect(result).toEqual({
        prefix_1: ["Some sample text formatted", "Other sample text formatted"],
        prefix_2: ["New sample text formatted"],
      });
      expect(mockPrepareChangelogEntry).toHaveBeenCalledTimes(entries.length);
      entries.forEach((entry) => {
        expect(mockPrepareChangelogEntry).toHaveBeenCalledWith(
          entry,
          prNumber,
          prLink
        );
      });
    });

    test("throws an error when encountering an invalid entry at the beginning of entries array", () => {
      const entries = [
        "- prefix_1: Some sample text - invalid",
        "- prefix_2: Other sample text",
        "- prefix_3: New sample text",
      ];
      mockPrepareChangelogEntry.mockImplementationOnce(() => {
        throw new Error("Invalid entry");
      });

      expect(() => {
        prepareChangelogEntriesMap(
          entries,
          prNumber,
          prLink,
          mockPrepareChangelogEntry
        );
      }).toThrow("Invalid entry");

      expect(mockPrepareChangelogEntry).toHaveBeenCalledWith(
        entries[0],
        prNumber,
        prLink
      );
      expect(mockPrepareChangelogEntry).toHaveBeenCalledTimes(1);
    });

    test("throws an error when encountering an invalid entry in between of entries array", () => {
      const entries = [
        "- prefix_1: Some sample text",
        "- prefix_2: Other sample text - invalid",
        "- prefix_3: New sample text",
      ];
      mockPrepareChangelogEntry
        .mockReturnValueOnce(["Some sample text formatted", "prefix_1"])
        .mockImplementationOnce(() => {
          throw new Error("Invalid entry");
        });

      expect(() => {
        prepareChangelogEntriesMap(
          entries,
          prNumber,
          prLink,
          mockPrepareChangelogEntry
        );
      }).toThrow("Invalid entry");

      expect(mockPrepareChangelogEntry).toHaveBeenCalledWith(
        entries[0],
        prNumber,
        prLink
      );
      expect(mockPrepareChangelogEntry).toHaveBeenCalledWith(
        entries[1],
        prNumber,
        prLink
      );
      expect(mockPrepareChangelogEntry).toHaveBeenCalledTimes(2);
    });

    test("throws an error when encountering an invalid entry at the end of entries array", () => {
      const entries = [
        "- prefix_1: Some sample text",
        "- prefix_2: Other sample text",
        "- prefix_3: New sample text - invalid",
      ];
      mockPrepareChangelogEntry
        .mockReturnValueOnce(["Some sample text formatted", "prefix_1"])
        .mockReturnValueOnce(["Other sample text formatted", "prefix_2"])
        .mockImplementationOnce(() => {
          throw new Error("Invalid entry");
        });

      expect(() => {
        prepareChangelogEntriesMap(
          entries,
          prNumber,
          prLink,
          mockPrepareChangelogEntry
        );
      }).toThrow("Invalid entry");

      expect(mockPrepareChangelogEntry).toHaveBeenCalledWith(
        entries[0],
        prNumber,
        prLink
      );
      expect(mockPrepareChangelogEntry).toHaveBeenCalledWith(
        entries[1],
        prNumber,
        prLink
      );
      expect(mockPrepareChangelogEntry).toHaveBeenCalledWith(
        entries[2],
        prNumber,
        prLink
      );
      expect(mockPrepareChangelogEntry).toHaveBeenCalledTimes(3);
    });
  });

  describe("prepareChangesetEntriesContent", () => {
    test("correctly formats changeset entries content for one pefix type", () => {
      const changelogEntriesMap = {
        prefix_1: ["- Some sample text", "- Other sample text"],
      };
      const expectedContent =
        `prefix_1:\n` + `- Some sample text\n` + `- Other sample text`;

      const result = prepareChangesetEntriesContent(changelogEntriesMap);
      expect(result).toBe(expectedContent);
    });

    test("correctly formats changeset entries content for more than one pefix type", () => {
      const changelogEntriesMap = {
        prefix_1: ["- Some sample text", "- Other sample text"],
        prefix_2: ["- New sample text"],
      };
      const expectedContent =
        `prefix_1:\n` +
        `- Some sample text\n` +
        `- Other sample text\n\n` +
        `prefix_2:\n` +
        `- New sample text`;

      const result = prepareChangesetEntriesContent(changelogEntriesMap);
      expect(result).toBe(expectedContent);
    });

    test("returns empty string correctly formats changeset entries content more than one pefix type", () => {
      const changelogEntriesMap = {};
      const result = prepareChangesetEntriesContent(changelogEntriesMap);
      expect(result).toBe("");
    });
  });
});
