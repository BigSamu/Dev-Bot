
/**
 * Formats an error message with specific styling and returns it as an HTML string.
 * It transforms the PascalCase 'name' of the error to spaced string, makes it bold,
 * prefixes it with a cross mark emoji, and places the 'message' in a paragraph.
 *
 * @param {Object} inputError - The error object to format.
 * @param {string} inputError.name - The PascalCase name of the error.
 * @param {string} inputError.message - The descriptive message of the error.
 * @returns {string} Formatted error message as an HTML string.
 *

 */
export const formatErrorMessage = (inputError) => {
  const spacedName = inputError.name.replace(/([A-Z])/g, " $1").trim();
  const outputErrorMessage =
    `### ❌ ${spacedName}\n` + "\n" + `${inputError.message}\n`;
  return outputErrorMessage;
};

/**
 * Capitalizes the first letter of a given string.
 *
 * @param {string} str - The string to be capitalized.
 * @returns {string} The capitalized string if the input is a valid string,
 *                   otherwise returns the original input.
 */
export const capitalize = (str) => {
  if (str && typeof str === 'string') {
      return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return str;
}
