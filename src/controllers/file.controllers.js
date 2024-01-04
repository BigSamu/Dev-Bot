import {
  fileServices,
} from "../services/index.js";


export const getFileByPath = async (req, res) => {
  try {
    const { path } = req.query;
    const file = await fileServices.getFileByPath(path);
    res.json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllFileByPath = async (req, res) => {
  try {
    const { path } = req.query;
    const files = await fileServices.getAllFileByPath(path);
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrUpdateFile = async (req, res) => {
  try {
    const fileData = req.body;
    const updatedFile = await fileServices.createOrUpdateFile(fileData);
    res.status(201).json(updatedFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFileByPath = async (req, res) => {
  try {
    const { path } = req.query;
    await fileServices.deleteFileByPath(path);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAllFilesByPath = async (req, res) => {
  try {
    const { path } = req.query;
    await fileServices.deleteAllFilesByPath(path);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fileControllers = {
  getFileByPath,
  getAllFileByPath,
  createOrUpdateFile,
  deleteFileByPath,
  deleteAllFilesByPath,
}
