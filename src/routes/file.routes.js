import express from "express";
import {
  getFileByPath,
  getAllFileByPath,
  createOrUpdateFile,
  deleteFileByPath,
  deleteAllFilesByPath,
} from "../controllers/file.controllers.js";

const fileRouter = express.Router();

// Route for GitHub webhooks
fileRouter.get("/files", getFileByPath);
fileRouter.get("/directory/files", getAllFileByPath);
fileRouter.post("/files", createOrUpdateFile);
fileRouter.delete("/files", deleteFileByPath);
fileRouter.delete("/directory/files", deleteAllFilesByPath);

export default fileRouter;
