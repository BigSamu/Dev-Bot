import {
  RELEASE_NOTES_SECTION_TITLES_MAPPING,
  MAX_ENTRY_LENGTH,
} from "../config/constants.js";

import { resolve } from "path";

export const filePath = resolve(__dirname, "..", "..", "CHANGELOG.md");
export const fragmentDirPath = resolve(
  __dirname,
  "..",
  "..",
  "changelogs",
  "fragments"
);
export const fragmentTempDirPath = resolve(
  __dirname,
  "..",
  "..",
  "changelogs",
  "temp_fragments"
);
export const releaseNotesDirPath = resolve(
  __dirname,
  "..",
  "..",
  "release-notes"
);

export function getCurrentDateFormatted() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const formattedMonth = month.toString().padStart(2, "0");
  const formattedDay = day.toString().padStart(2, "0");

  return `${year}-${formattedMonth}-${formattedDay}`;
}

// validate format of fragment files
export function validateFragment(content) {
  const sections = content.split("\n\n");

  // validate each section
  for (const section of sections) {
    const lines = section.split("\n");
    const sectionName = lines[0];
    const sectionKey = sectionName.slice(0, -1);

    if (
      !RELEASE_NOTES_SECTION_TITLES_MAPPING[sectionKey] ||
      !sectionName.endsWith(":")
    ) {
      throw new Error(`Unknown section ${sectionKey}.`);
    }
    // validate entries. each entry must start with '-' and a space. then followed by a string. string must be non-empty and less than 50 characters
    const entryRegex = new RegExp(
      `^-.{1,${MAX_ENTRY_LENGTH}}\\(\\[#.+]\\(.+\\)\\)$`
    );
    for (const entry of lines.slice(1)) {
      if (entry === "") {
        continue;
      }
      // if (!entryRegex.test(entry)) {
      if (!entryRegex.test(entry.trim())) {
        throw new Error(`Invalid entry ${entry} in section ${sectionKey}.`);
      }
    }
  }
}
