/**
 * Get a file in a given path in a GitHub repository.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} branch - The branch name.
 * @param {string} filePath - The file path.
 * @returns {Promise<object>} - An object containing the file details.
 * @throws {Error} - If an error occurs while fetching the file.
 */
export const getFileByPath = async (octokit, owner, repo, branch, filePath) => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      ref: branch,
      path: filePath,
    });

    if (Array.isArray(data)) {
      throw new Error("The provided path is a directory, not a file.");
    }

    return {
      name: data.name,
      path: data.path,
      download_url: data.download_url,
      content: data.content,
      sha: data.sha,
    };
  } catch (error) {
    console.error("Error fetching file:", error);
    throw error;
  }
};

/**
 * Gets all files in a given directory in the GitHub repository.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} branch - The branch name.
 * @param {string} directoryPath - The directory path.
 * @returns {Promise<object[]>} - An array of objects containing the file details.
 * @throws {Error} - If an error occurs while fetching the directory files.
 *
 */

export const getAllFilesByPath = async (octokit, owner, repo, branch, directoryPath) => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      ref: branch,
      path: directoryPath,
    });

    if (!Array.isArray(data)) {
      throw new Error("The provided path is not a directory.");
    }

    // Filter out only files and return their details
    return data
      .filter((item) => item.type === "file")
      .map((file) => ({
        name: file.name,
        path: file.path,
        download_url: file.download_url,
        content: file.content,
        sha: file.sha,
      }));
  } catch (error) {
    console.error("Error fetching directory contents:", error);
    throw error;
  }
};

/**
 * Creates or updates a new file in the GitHub repository.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} branch - The branch name.
 * @param {string} filePath - The file path.
 * @param {string} content - The file content.
 * @param {string} message - The commit message.
 * @returns {Promise<object>} - An object containing the created or updated file details.
 * @throws {Error} - If an error occurs while creating or updating the file.
 */
export const createOrUpdateFileByPath = async (
  octokit,
  owner,
  repo,
  branch,
  filePath,
  content,
  message,
  sha
) => {
  try {
    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      ref: branch,
      path: filePath,
      message,
      content: Buffer.from(content).toString("base64"),
      sha,
    });

    return {
      name: data.content.name,
      path: data.content.path,
      download_url: data.content.download_url,
      content: data.content.content,
      sha: data.content.sha,
    };
  } catch (error) {
    console.error("Error creating file:", error);
    throw error;
  }
};

/**
 * Deletes a file from the GitHub repository.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} branch - The branch name.
 * @param {string} filePath - The file path.
 * @param {string} sha - The file SHA.
 * @param {string} message - The commit message.
 * @returns {Promise<void>} A Promise that resolves when the file is deleted.
 * @throws {Error} - If an error occurs while deleting the file.
 */
export const deleteFileByPath = async (
  octokit,
  owner,
  repo,
  branch,
  filePath,
  sha,
  message
) => {
  try {
    await octokit.rest.repos.deleteFile({
      owner,
      repo,
      path: filePath,
      message,
      sha,
      branch,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

/**
 * Deletes all files in a given directory in the GitHub repository.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} branch - The branch name.
 * @param {string} directoryPath - The directory path.
 * @param {string} message - The commit message.
 * @returns {Promise<void>} A Promise that resolves when all files are deleted.
 * @throws {Error} - If an error occurs while deleting all files.
 */
export async function deleteAllFilesByPath(
  octokit,
  owner,
  repo,
  branch,
  directoryPath,
  message
) {
  try {
    // Get the current tree for the branch
    const { data: currentTree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: true, // Recursively get all files in the tree
    });

    // Filter the current tree to exclude the files in the specified directory
    const filteredTree = currentTree.tree.filter((item) => !item.path.startsWith(directoryPath));

    // Create a new tree containing the filtered files
    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      tree: filteredTree,
    });

    // Get the current commit for the branch
    const { data: currentCommit } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: branch,
    });

    // Create a new commit that points to the new tree
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: newTree.sha,
      parents: [currentCommit.sha],
    });

    // Update the branch reference to the new commit
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });

    console.log(`All files in ${directoryPath} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting all files:", error);
    throw error;
  }
}
