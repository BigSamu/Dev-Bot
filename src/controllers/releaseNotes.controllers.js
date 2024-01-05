import {
  fileServices,
  authServices,
} from "../services/index.js";

export const processReleaseNotes = async (req, res) => {
  // Complete this function
  // You can use the functions imported above to help you
  // You can check documentation of these functions in their respective under src/services

  // Your post request must always send the github 'repo' name, github 'owner' username, github 'branch' name
  // in a body object or path parameters (you decide which one to use).
  // In the routes I am using body params as default

  // Select one
  // const { repo, owner, branch } = req.body;  // api/release-notes
  // const { repo, owner, branch } = req.params; // api/release-notes/:owner/:repo/:branch

  // The octokit instance can get witht the following

  // const octokit = await getOcktokitClient(owner, repo);

  // The commit message can be defined here. For instance:
  // const message = "processing release notes for files pr_1.yml, pr_2.yml, pr_3.yml, etc";

  // The content of the file you definend here. The function will convert it to base64 for you, so it can
  // be uploaded to github
  // const content = "content of the file";

  // The sha of the file can be obtained with the following function.
  // const file = await getFileByPath(octokit, owner, repo, branch, filePath);
  // const sha = file.sha;

  // Consider that for creating a file you need to pass undefined for sha.
  // However for updating a file you need to pass the sha of the file you want to update.

  console.log("Processing release notes...");
};
