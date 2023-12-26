import express from "express";
import { processReleaseNotes } from "../controllers/releaseNotes.controllers.js";

const releaseNotesRouter = express.Router();

// Route for GitHub webhooks
releaseNotesRouter.post("/release-notes", processReleaseNotes);

export default releaseNotesRouter;
