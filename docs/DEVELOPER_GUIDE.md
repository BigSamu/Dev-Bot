<!-- omit in toc -->
# Developer Guide

If you are interested in contributing to the `OpenSearch-bot` GitHub App or customizing the app to fit your particular use case, the following instructions will guide you through the process of setting up your developer environment.

<!-- omit in toc -->
## Table of Contents
- [Introduction](#introduction)
- [Initialize Local Environment Setup](#initialize-local-environment-setup)
  - [Fork the `OpenSearch-bot` Repository](#fork-the-opensearch-bot-repository)
  - [Install `ngrok` on Your Local Machine](#install-ngrok-on-your-local-machine)
  - [Verify the Contents of Your `.gitignore` File](#verify-the-contents-of-your-gitignore-file)
- [Register Your Own GitHub App](#register-your-own-github-app)
  - [Initiate the Process](#initiate-the-process)
  - [Configure the App](#configure-the-app)
  - [Finalize App Settings](#finalize-app-settings)
- [Complete Local Environment Setup](#complete-local-environment-setup)
  - [Create a `.env` File](#create-a-env-file)
  - [Adjust the Code in `main.js`](#adjust-the-code-in-mainjs)
  - [Start Your Local Server](#start-your-local-server)
- [Fork Your Repository and Install Your App](#fork-your-repository-and-install-your-app)
  - [Install the App on Your Base Repository](#install-the-app-on-your-base-repository)
  - [Sign In to a Second GitHub Account](#sign-in-to-a-second-github-account)
  - [Fork Your Base Repository and Install Your App](#fork-your-base-repository-and-install-your-app)
- [Open a PR from Your Forked Repository](#open-a-pr-from-your-forked-repository)

## Introduction

The `OpenSearch-bot` GitHub App is designed for scenarios in which a contributor to an OpenSearch repository opens a pull request from a branch in their forked OpenSearch repository. Therefore, in order to ensure your changes work as expected, you will need to replicate this scenario by performing the following actions:

- Initialize the setup of your local environment. This will be your base repository.
- Create your own GitHub App from your base repository.
- Complete the setup of your local environment.
- Use a second GitHub account to create a fork of your base repository and install your GitHub App on both repositories.
- Open a pull request from your forked repository to your base repository.

The following sections detail how to perform each of these actions.

## Initialize Local Environment Setup

The first step toward replicating the scenario the `OpenSearch-bot` GitHub App is designed for is to set up secure remote access to your own version of the source code.  

### Fork the `OpenSearch-bot` Repository

- Create your own fork of the `OpenSearch-bot` repository on GitHub.
- Clone your forked repository onto your local machine.
- From the root directory of your forked repository, run `npm i` to install all project dependencies.

### Install `ngrok` on Your Local Machine

This GitHub App relies on webhooks for its functionality. To test your changes, you will need to register your own GitHub App (instructions below) and configure it with a webhook URL. `ngrok` is a useful tool for establishing a secure tunnel to your local server, which will generate the necessary webhook URL.

At this point in the process, you only need to install `ngrok`. You won't need to start an `ngrok` tunnel until you are registering your GitHub App.

- Download and install `ngrok` from [ngrok.com/download](https://ngrok.com/download).
- Sign up for a free `ngrok` account to receive an authtoken.
- Follow the instructions to add your authtoken to your `ngrok` configuration.

### Verify the Contents of Your `.gitignore` File

Before moving forward, it's crucial to ensure that sensitive information does not get accidentally pushed to your remote repository on GitHub. Please ensure that the `.gitignore` file in your forked repository includes the following entries:

```
*.pem

coverage/

node_modules/
dist/
.env
```

These entries prevent Git from tracking certain files and directories:

`*.pem`: Excludes private key files, which are sensitive and should remain confidential.

`coverage/`, `node_modules/`, and `dist/`: While these directories do not necessarily contain sensitive information, excluding them avoids unnecessary clutter in your repository. They typically contain generated reports, installed dependencies, and built files, respectively.

`.env`: Critical for omitting environment variables that contain sensitive configuration settings and secrets.

You will add the `.pem` file and `.env` file to your local repository in a later step.

## Register Your Own GitHub App

As mentioned above, in order to verify that your changes work as expected, you will need to register your own GitHub App for testing purposes:

### Initiate the Process

- Click on your profile photo at the top right of any page within GitHub.
- Navigate to "Settings" > "Developer Settings" > "GitHub Apps"
- Click on the "New GitHub App" button or follow the "Register a new GitHub App" link in the page description. This will take you to the configuration page.

### Configure the App

The configuration page provides a number of options for customizing a GitHub App for specific use cases. Below is the information you will need to set up an `OpenSearch-bot` clone. The subheadings in this section represent the field labels where you will provide this information.

<!-- omit in toc -->
#### GitHub App name

Enter a unique name for your GitHub App. We suggest something like "OpenSearch-bot-[unique-id]".

<!-- omit in toc -->
#### Homepage URL

Provide the URL of your fork of the `OpenSearch-bot` repository.

<!-- omit in toc -->
#### Webhook URL

To generate this URL, you will need to activate `ngrok`: 

- Open your command line and start an `ngrok` tunnel with the command `ngrok http [port]`, replacing `[port]` with the port number your local server is running on (e.g., `ngrok http 3000`).
- Locate the "Forwarding" URL displayed by `ngrok` (e.g., `https://****-****.ngrok-free.app`).
- In the "Webhook URL" field on your GitHub App's configuration page, enter this `ngrok` forwarding URL followed by the API endpoint `/api/webhook`. This combination forms the complete webhook URL.

Your Webhook URL should resemble the following format:
```
https://****-****.ngrok-free.app/api/webhook
```

<!-- omit in toc -->
#### Webhook secret (optional)

Enter a secure secret in this field. It can be any string of text. You will need to add this secret as an environment variable in your forked repository, as well (instructions below).

<!-- omit in toc -->
#### Permissions

Click on the "Repository permissions" dropdown menu and set the following access permissions:
- **Contents:** Read and write
- **Metadata:** Read only
- **Pull requests:** Read and write
- **Secrets:** Read and write
- **Webhooks:** Read and write

<!-- omit in toc -->
#### Subscribe to events

Select the "Pull request" checkbox.

<!-- omit in toc -->
#### Where can this GitHub App be installed?

Select "Any account".

### Finalize App Settings

Once you have configured the app as outlined above, click the "Create GitHub App" button. You will be directed to a settings page for your newly-registered app.

For the OAuth user authorization process, you will need to generate a **client secret:**

- Under the "Client secrets" section, click the "Generate a new client secret" button.
- Copy this secret and store it in a secure location.
- Click the green "Save changes" button farther down the page.

Additionally, your app requires a **private key** to authenticate itself with GitHub:

- Scroll down to the "Private keys" section at the bottom of the settings page.
- Click "Generate a private key" and download the `.pem` file to a secure location.

## Complete Local Environment Setup

With the information obtained from registering your GitHub App, you may now complete the setup of your local environment.

### Create a `.env` File

The Express server for this code base relies on environment variables for its configuration. In the root directory of your local repository, create a `.env` file with the following variables. (Note that the values provided here are examples.)

```js
GITHUB_APP_IDENTIFIER="123456"
GITHUB_APP_PRIVATE_KEY="your-private-key-path.pem"
GITHUB_APP_WEBHOOK_SECRET="your-webhook-secret"
PORT=3000
```

`GITHUB_APP_IDENTIFIER`: This is the six-digit "App ID" provided at the top of your GitHub App's settings page.

`GITHUB_APP_PRIVATE_KEY`: Enter the absolute or relative path to the `.pem` file you downloaded earlier. If the file is in your projects root directory, simply enter the file name. 

`GITHUB_APP_WEBHOOK_SECRET`: Use the secret you provided when you first registered your app.

`PORT`: This can be any available port number on which your local server will run. The example here uses `3000`.

**IMPORTANT:** Double-check that you have `*.pem` and `.env` listed in your `.gitignore` file.

### Adjust the Code in `main.js`

To get the app to recognize your `.pem` file, you will need to adjust some lines of code in `main.js`.

Find this code block:
```js
// 2) Set configured values
const appId = process.env.GITHUB_APP_IDENTIFIER;
// const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const secret = process.env.GITHUB_APP_WEBHOOK_SECRET;
// const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
```

Uncomment the two commented lines of code, and comment out the last line of code. Your code block should now look like this:

```js
// 2) Set configured values
const appId = process.env.GITHUB_APP_IDENTIFIER;
const secret = process.env.GITHUB_APP_WEBHOOK_SECRET;
const privateKeyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH;
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
// const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
```

### Start Your Local Server

Once your `.env` file is properly configured and you have modified the above-mentioned code block, you are ready to start your local server.

This project uses Express for its server framework, and the server's entry point is the `main.js` file located in the root directory.

To start the server, navigate to the root directory in your command line and run the following command:

```
node main.js
```

Alternatively, if you have `nodemon` installed, you can run:

```
nodemon main.js
```

`nodemon` is a tool that improves local development by automatically restarting the server whenever it detects changes in the code base. You can install `nodemon` globally on your local machine by running the following command:

```
npm install -g nodemon
```

If your server starts successfully, you should see the following message in your command line:

```
Server is listening for events at: http://localhost:3000/api/webhook
Press Ctrl + C to quit
```

If you set a different port number as your `PORT` environment variable, you will see that number reflected in the URL.

## Fork Your Repository and Install Your App

As mentioned above, in order to replicate the scenario the `OpenSearch-bot` is designed to address, you will need to install your own GitHub App on your base repo as well as on a fork of this repo belonging to a different owner.

### Install the App on Your Base Repository

Since you are already signed in to your main account, begin by installing your GitHub App on your base repository.

<!-- omit in toc -->
#### Navigate to Your GitHub App's Public Page

- Click on your profile photo at the top right of any GitHub page.
- Select "Settings" from the dropdown menu.  
- Scroll down to "Developer settings" at the bottom of the left side menu. 
- Under the "GitHub Apps" heading, find your app and click "Edit".
- In the edit page menu, select "Public page" to go to your GitHub App's public URL. Record this URL for future use.

<!-- omit in toc -->
#### Install the App

- On the public page of your GitHub App, click the green "Install" button.
- Select the account where you want to install the app.
- Choose whether you want to install the app on all your repositories or only on select ones:
  - If you choose "Only select repositories", be sure that your base repository is included among your options.
- Confirm the installation by clicking on the green "Install" button.

### Sign In to a Second GitHub Account

If you already own a second GitHub account, and you are also signed in to that second account:

- Click on your profile photo at the top right of the screen.
- Select the "Switch account" dropdown menu.
- Find the account you want to switch to, and click on that account name.

If you are not signed in to your second account:

- Click on your profile photo.
- Select "Add account".
- Sign in to your second account.

If you do not already own a second GitHub account, you will need to register one:

- Click on your profile photo.
- Select "Sign out".
- On the "Select account to sign out" page, select "Sign out from all accounts".
- From GitHub's home page, follow the process to register a new account.

### Fork Your Base Repository and Install Your App

While signed on to your second account, create a fork of your base repository.

Once your fork has been created, navigate to the URL of your GitHub App and follow the instructions provided above to install the app on this repository.

## Open a PR from Your Forked Repository

Now that your app is installed on your forked repository, return to your fork and commit a simple change. For example:

- Select the "Add file" dropdown button from the main page of your fork.
- Select "Create new file".
- Name your file (e.g., "test.txt") and enter some text in the text area that says, "Enter file contents here".
- Click the green "Commit changes..." button.
- In the modal window that opens, click on the green "Commit changes" button.

Next, open a pull request against your base repository:

- Click on the "Contribute" dropdown menu button.
- You should see a message like "This branch is 1 commit ahead of" followed by the name of your base repository.
- Click on the green "Open pull request" button.
- On the next screen click on the green "Create pull request" button.

**IMPORTANT:** For the GitHub App to work as intended, you will need to add a "## Changelog" heading in the "Add a description" text area. Below that heading, enter a hyphen followed by a space and one of the following prefixes:

 - breaking
 - chore
 - deprecate
 - doc
 - feat
 - fix
 - infra
 - refactor
 - security
 - skip
 - test

After the prefix, add a colon and then a brief description of your changes. Your description should look something like this:

```markdown
## Changelog

- doc: Add test.txt
```

Once you have added the text to your PR description, click the green "Create pull request" button. If everything is configured correctly, you should see activity in your command line and notice either a `.yml` changeset file being committed to your PR or a comment added to your PR notifying you of a formatting error in your PR description.