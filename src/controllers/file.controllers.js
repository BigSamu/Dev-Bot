import { fileServices, authServices } from "../services/index.js";

const getFileByPath = async (req, res, next) => {
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
    res.json({ data: file });
  } catch (error) {
    next(error);
  }
};

const getAllFileByPath = async (req, res, next) => {
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
    res.json({ data: files });
  } catch (error) {
    next(error);
  }
};

const createOrUpdateFile = async (req, res, next) => {
  try {
    const { owner, repo, branch, path } = req.query;
    const { content, message } = req.body;
    const decodedContent = Buffer.from(content, "base64").toString("utf-8");
    const octokit = await authServices.getOcktokitClient(owner, repo);
    await fileServices.createOrUpdateFileByPath(
      octokit,
      owner,
      repo,
      branch,
      path,
      decodedContent,
      message
    );
    res.status(201).json({ message: "File created/updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteFileByPath = async (req, res, next) => {
  try {
    const { owner, repo, branch, path } = req.query;
    const { message } = req.body;
    const octokit = await authServices.getOcktokitClient(owner, repo);
    await fileServices.deleteFileByPath(
      octokit,
      owner,
      repo,
      branch,
      path,
      message
    );
    res.status(204).json({ message: "File deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteAllFilesByPath = async (req, res, next) => {
  try {
    const { path } = req.query;
    await fileServices.deleteAllFilesByPath(path);
    res.status(204).json({ message: "All files deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const fileControllers = {
  getFileByPath,
  getAllFileByPath,
  createOrUpdateFile,
  deleteFileByPath,
  deleteAllFilesByPath,
};
