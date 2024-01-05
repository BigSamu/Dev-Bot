import express from "express";
import { fileControllers } from "../controllers/file.controllers.js";

const fileRouter = express.Router();

// Route for GitHub webhooks
fileRouter.get("/files", fileControllers.getFileByPath);
fileRouter.get("/directory/files", fileControllers.getAllFileByPath);
fileRouter.post("/files", fileControllers.createOrUpdateFile);
fileRouter.delete("/files", fileControllers.deleteFileByPath);
fileRouter.delete("/directory/files", fileControllers.deleteAllFilesByPath);

export default fileRouter;
