import { fileServices, authServices } from "../services/index.js";

export const getFileByPath = async (req, res) => {
  try {
    const { owner, repo, branch, path } = req.query;
    const octokit = await authServices.getOcktokitClient(owner, repo);
    const file = await fileServices.getFileByPath(
      octokit,
      owner,
      repo,
      branch,
      path
    );
    res.json(file);
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};

export const getAllFileByPath = async (req, res) => {
  try {
    const { owner, repo, branch, path } = req.query;
    const octokit = await authServices.getOcktokitClient(owner, repo);
    const files = await fileServices.getAllFilesByPath(
      octokit,
      owner,
      repo,
      branch,
      path
    );
    res.json(files);
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};

export const createOrUpdateFile = async (req, res) => {
  try {
    const { owner, repo, branch, path } = req.query;
    const { content, message } = req.body;
    const decodedContent = Buffer.from(content, "base64").toString("utf-8");
    const octokit = await authServices.getOcktokitClient(owner, repo);
    const commitMessage = (changesetFileSha) =>
      `Changeset file for PR #${prNumber} ${
        changesetFileSha ? "updated" : "created"
      }`;
    await fileServices.createOrUpdateFileByPath(
      octokit,
      owner,
      repo,
      branch,
      path,
      decodedContent,
      message
    );
    res.status(201).json({message: "File created/updated successfully"});
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};

export const deleteFileByPath = async (req, res) => {
  try {
    const { owner, repo, branch, path } = req.query;
    const { message } = req.body;
    const commitMessage = `Changeset file for PR #${prNumber} deleted`;
    const octokit = await authServices.getOcktokitClient(owner, repo);
    await fileServices.deleteFileByPath(
      octokit,
      owner,
      repo,
      branch,
      path,
      message
    );
    res.status(204).send({message: "File deleted successfully"});
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};

export const deleteAllFilesByPath = async (req, res) => {
  try {
    const { path } = req.query;
    await fileServices.deleteAllFilesByPath(path);
    res.status(204).send();
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};

export const fileControllers = {
  getFileByPath,
  getAllFileByPath,
  createOrUpdateFile,
  deleteFileByPath,
  deleteAllFilesByPath,
};
