/**
 * Get a file in a given path in a GitHub repository.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} branch - The branch name.
 * @param {string} path - The file path.
 * @returns {Promise<object>} - An object containing the file details.
 * @throws {Error} - If an error occurs while fetching the file.
 */
const getFileByPath = async (octokit, owner, repo, branch, path) => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: owner,
      repo: repo,
      ref: branch,
      path: path,
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
    if(error.status === 404) {
      console.log(`File '${path}' not found.`);
      return;
    }
    console.error("Error fetching file:", error.message);
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

const getAllFilesByPath = async (
  octokit,
  owner,
  repo,
  branch,
  directoryPath
) => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: owner,
      repo: repo,
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
    console.error("Error fetching directory contents:", error.message);
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
 * @param {string} path - The file path.
 * @param {string} content - The file content.
 * @param {string} message - The commit message.
 * @returns {Promise<object>} - An object containing the created or updated file details.
 * @throws {Error} - If an error occurs while creating or updating the file.
 */
const createOrUpdateFileByPath = async (
  octokit,
  owner,
  repo,
  branch,
  path,
  content,
  message
) => {
  try {
    const changesetFile = await getFileByPath(
      octokit,
      owner,
      repo,
      branch,
      path
    );
    // const sha = changesetFile ? changesetFile.sha : undefined;
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: owner,
      repo: repo,
      branch: branch,
      path: path,
      message: message,
      content: Buffer.from(content).toString("base64"),
      sha: changesetFile?.sha,
    });
    // Log the message determined by the calling function
    console.log(message);
    return { message: message };
  } catch (error) {
    
    console.error(`Error creating/updating file '${path}':`, error.message);
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
 * @param {string} path - The file path.
 * @param {string} message - The commit message.
 * @returns {Promise<void>} A Promise that resolves when the file is deleted.
 * @throws {Error} - If an error occurs while deleting the file.
 */
const deleteFileByPath = async (
  octokit,
  owner,
  repo,
  branch,
  path,
  message
) => {
  try {
    const changesetFile = await getFileByPath(
      octokit,
      owner,
      repo,
      branch,
      path
    );
    if (changesetFile) {
      await octokit.rest.repos.deleteFile({
        owner: owner,
        repo: repo,
        path: path,
        message: message,
        sha: changesetFile.sha,
        branch: branch,
      });
    }
    console.log(changesetFile ? message : "No file to delete.");
    return { message: changesetFile ? message : "No file to delete." };
  } catch (error) {
    console.error("Error deleting file:", error.message);
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
async function deleteAllFilesByPath(
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
      owner: owner,
      repo: repo,
      tree_sha: branch,
      recursive: true, // Recursively get all files in the tree
    });

    // Filter the current tree to exclude the files in the specified directory
    const filteredTree = currentTree.tree.filter(
      (item) => !item.path.startsWith(directoryPath)
    );

    // Create a new tree containing the filtered files
    const { data: newTree } = await octokit.git.createTree({
      owner: owner,
      repo: repo,
      tree: filteredTree,
    });

    // Get the current commit for the branch
    const { data: currentCommit } = await octokit.git.getCommit({
      owner: owner,
      repo: repo,
      commit_sha: branch,
    });

    // Create a new commit that points to the new tree
    const { data: newCommit } = await octokit.git.createCommit({
      owner: owner,
      repo: repo,
      message: message,
      tree: newTree.sha,
      parents: [currentCommit.sha],
    });

    // Update the branch reference to the new commit
    await octokit.git.updateRef({
      owner: owner,
      repo: repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });

    console.log(`All files in ${directoryPath} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting all files:", error.message);
    throw error;
  }
}

export const fileServices = {
  getFileByPath,
  getAllFilesByPath,
  createOrUpdateFileByPath,
  deleteFileByPath,
  deleteAllFilesByPath,
};
