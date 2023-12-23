<!-- omit in toc -->
# OpenSearch-bot

This project contains the source code for a GitHub App that automates the release process in OpenSearch repositories. The app works as follows:
1. **PR Changelog Processing:** When a user opens a pull request (PR) from a forked repository against an OpenSearch repository, the app scans the PR description, looking for changelog entries listed in a "Changelog" section. It then generates a changeset file from these entries and commits this file to the open PR.
2. **Automating Release Documentation:** When the PR is merged, the changeset file is stored in a designated directory in the base repository. At the time of a new release, the app scans this directory and uses the changeset files to generate comprehensive release notes and update the changelog with new entries.

This process ensures a streamlined and automated approach to maintaining up-to-date release documentation in OpenSearch repositories.

<!-- omit in toc -->
## Table of Contents
- [Installation](#installation)
  - [Installation for Repository Usage](#installation-for-repository-usage)
    - [Installing on an OpenSearch Repository](#installing-on-an-opensearch-repository)
    - [Installing on Forked Repositories](#installing-on-forked-repositories)
  - [Setting Up the Codebase for Development](#setting-up-the-codebase-for-development)
    - [Fork the `OpenSearch-bot` Repository](#fork-the-opensearch-bot-repository)
    - [Use `ngrok` to Create a Secure Tunnel to Localhost](#use-ngrok-to-create-a-secure-tunnel-to-localhost)
    - [Register Your Own GitHub App](#register-your-own-github-app)
      - [Starting the Process](#starting-the-process)
      - [Configuring the App](#configuring-the-app)
      - [Finalizing App Settings](#finalizing-app-settings)
    - [Create a `.gitignore` File](#create-a-gitignore-file)
    - [Create a `.env` File](#create-a-env-file)

## Installation

This section outlines the steps for installing and setting up the `OpenSearch-bot` GitHub App. It addresses:
- Users who want to install the app on repositories they own or maintain. 
- Developers interested in contributing to or customizing the source code for their own use cases.

### Installation for Repository Usage

In order for the app to work as intended, it must be installed both on an OpenSearch repository as well as on any forked repositories that PRs originate from.

#### Installing on an OpenSearch Repository

- Navigate to the [OpenSearch-bot](https://github.com/apps/opensearch-bot) installation page and click "Install". 
- Select the OpenSearch repository where this app will manage PRs and process changeset files.
- Follow the instructions to complete the installation.

#### Installing on Forked Repositories

- In the forked OpenSearch repository, navigate to the [OpenSearch-bot](https://github.com/apps/opensearch-bot) installation page and click "Install".
- Follow the instructions to complete the installation on the forked repository.

### Setting Up the Codebase for Development

For developers who would like to contribute to the `OpenSearch-bot` source code or customize it for their own use cases, the following instructions lay out the process for setting up a local development environment.

#### Fork the `OpenSearch-bot` Repository

- Create your own fork of the `OpenSearch-bot` repository on GitHub.
- Clone your forked repository onto your local machine.
- From the root directory of your forked repository, run `npm i` to install all project dependencies.

#### Use `ngrok` to Create a Secure Tunnel to Localhost

This GitHub App relies on webhooks for its functionality. To test your changes, you will need to register your own GitHub App (instructions below) and configure it with a webhook URL. Use `ngrok` to set up a secure tunnel to your local server for webhook testing.

- Download and install `ngrok` from [ngrok.com/download](https://ngrok.com/download).
- Sign up for a free `ngrok` account to receive an authtoken for your configuration.
- Start an `ngrok` tunnel with the command `ngrok http [port]` (e.g., `ngrok http 3000`).
- The "Forwarding" URL displayed by `ngrok` (e.g., `https://****-****.ngrok-free.app`) will serve as the base of the webhook URL you will need below.

#### Register Your Own GitHub App
As mentioned, in order to verify that your changes work as expected, you will need to register your own GitHub App for testing purposes:

##### Starting the Process
- Click on your profile photo at the top right of any page within GitHub.
- Navigate to "Settings" > "Developer Settings" > "GitHub Apps"
- Click on the "New GitHub App" button or follow the "Register a new GitHub App" link in the page description. This will take you to the configuration page.

##### Configuring the App

**GitHub App name:** Enter a unique name for your GitHub App. We suggest something like "OpenSearch-bot-[unique-id]".

**Homepage URL:** Enter the URL of your fork of the `OpenSearch-bot` repository.

**Webhook URL:** Enter the `ngrok` base URL with the endpoint `/api/webhooks` appended on the end (e.g., `https://****-****.ngrok-free.app/api/webhooks`).

**Webhook secret (optional):** Please provide a secure secret in this field. It can be any string of text. You will need to add this secret as an environment variable in your forked repository, as well (instructions below).

**Permissions:** Click on the "Repository permissions" dropdown menu and set the following access permissions:
- **Contents:** Read and write
- **Metadata:** Read only
- **Pull requests:** Read and write
- **Secrets:** Read and write
- **Webhooks:** Read and write

**Subscribe to events:** Select the "Pull request" checkbox.

**Where can this GitHub App be installed?** Select "Any account".

##### Finalizing App Settings

Once you have configured the app as outlined above, click the "Create GitHub App" button. You will be directed to a settings page for your newly-registered app.

For the OAuth user authorization process, you will need to generate a **client secret:**
- Under the "Client secrets" section, click the "Generate a new client secret" button.
- Copy this secret and store it in a secure location.
- Click the green "Save changes" button farther down the page.

Additionally, your app requires a **private key** to authenticate itself with GitHub:
- Scroll down to the "Private keys" section at the bottom of the settings page.
- Click "Generate a private key" and download the `.pem` file to a secure location.

#### Create a `.gitignore` File

In your local repository, create a `.gitignore` file in your root directory containing the following:

```
*.pem

coverage/

node_modules/
dist/
.env
```

#### Create a `.env` File

The Express server for this code base uses environment variables. In the root directory of your local repository, create a `.env` file with the following variables. (The values are for illustration purposes only.)

```
GITHUB_APP_IDENTIFIER="123456"
PRIVATE_KEY_PATH="your-private-key-path.pem"
GITHUB_WEBHOOK_SECRET="your-webhook-secret"
PORT=3000
```

The `GITHUB_APP_IDENTIFIER` will be the six-digit "App ID" provided at the top of your GitHub App's settings page. This number 

For the `PRIVATE_KEY_PATH` variable, enter the path to the `.pem` file you downloaded earlier. If you have added the file to the root directory of your local repository, you can simply include the file name here. 

**IMPORTANT:** Make sure you have added `.pem` file types to your `.gitignore` file!

Your `GITHUB_WEBHOOK_SECRET` will be the secret you provided when you first registered your app.

Lastly, the `PORT` can be whatever port your local server is running on.