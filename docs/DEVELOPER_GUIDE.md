<!-- omit in toc -->
# Developer Guide

If you are interested in contributing to the `OpenSearch-bot` GitHub App or customizing the app to fit your particular use case, the following instructions will guide you through the process of setting up your developer environment.

<!-- omit in toc -->
## Table of Contents
- [Introduction](#introduction)
- [Initialize Local Environment Setup](#initialize-local-environment-setup)
- [Register Your Own GitHub App](#register-your-own-github-app)
  - [Initiate the Process](#initiate-the-process)
  - [Configure the App](#configure-the-app)
  - [Finalize App Settings](#finalize-app-settings)
- [Complete Local Environment Setup](#complete-local-environment-setup)
  - [Start Your Local Server](#start-your-local-server)
- [Fork Your Base Repo](#fork-your-base-repo)
  - [Sign In to a Second GitHub Account](#sign-in-to-a-second-github-account)
  - [Install Your App](#install-your-app)

## Introduction

The `OpenSearch-bot` GitHub App is designed for scenarios in which a contributor to an OpenSearch repository opens a pull request from a branch in their forked OpenSearch repository. Therefore, in order to ensure your changes work as expected, you will need to replicate this scenario by performing the following actions:

- Initialize the setup of your local environment. This will be your base repository.
- Create your own GitHub App from your base repository.
- Complete the setup of your local environment.
- Use a second GitHub account to create a fork of your base repository.
- Install your GitHub App on both your base and your forked repository.
- Open a pull request from your forked repository to your base repository.

The following sections detail how to perform each of these actions.

## Initialize Local Environment Setup

The first step toward replicating the scenario the `OpenSearch-bot` GitHub App is designed for is to set up secure remote access to your own version of the source code.  

<!-- omit in toc -->
### Fork the `OpenSearch-bot` Repository

- Create your own fork of the `OpenSearch-bot` repository on GitHub.
- Clone your forked repository onto your local machine.
- From the root directory of your forked repository, run `npm i` to install all project dependencies.

<!-- omit in toc -->
### Install `ngrok` on Your Local Machine

This GitHub App relies on webhooks for its functionality. To test your changes, you will need to register your own GitHub App (instructions below) and configure it with a webhook URL. `ngrok` is a useful tool for establishing a secure tunnel to your local server, which will generate the necessary webhook URL.

At this point in the process, you only need to install `ngrok`. You won't need to start an `ngrok` tunnel until you are registering your GitHub App.

- Download and install `ngrok` from [ngrok.com/download](https://ngrok.com/download).
- Sign up for a free `ngrok` account to receive an authtoken.
- Follow the instructions to add your authtoken to your `ngrok` configuration.

<!-- omit in toc -->
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
  
- In the "Webhook URL" field on your GitHub App's configuration page, enter this `ngrok` forwarding URL followed by the API endpoint `/api/webhooks`. This combination forms the complete webhook URL.

Your Webhook URL should resemble the following format:
```
https://****-****.ngrok-free.app/api/webhooks
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

<!-- omit from toc -->
### Create a `.env` File

The Express server for this code base relies on environment variables for its configuration. In the root directory of your local repository, create a `.env` file with the following variables. (Note that the values provided here are examples.)

```
GITHUB_APP_IDENTIFIER="123456"
PRIVATE_KEY_PATH="your-private-key-path.pem"
GITHUB_WEBHOOK_SECRET="your-webhook-secret"
PORT=3000
```

`GITHUB_APP_IDENTIFIER`: This is the six-digit "App ID" provided at the top of your GitHub App's settings page.

`PRIVATE_KEY_PATH`: Enter the absolute or relative path to the `.pem` file you downloaded earlier. If the file is in your projects root directory, simply enter the file name. 

`GITHUB_WEBHOOK_SECRET`: Use the secret you provided when you first registered your app.

`PORT`: This can be any available port number on which your local server will run. The example here uses `3000`.

**IMPORTANT:** Double-check that you have `*.pem` and `.env` listed in your `.gitignore` file.

### Start Your Local Server

Once your `.env` file is properly configured, you are ready to start your local server.

This project uses Express for its server framework, and the server's entry point is the `main.js` file located in the root directory. 

## Fork Your Base Repo

As mentioned above, in order to replicate the scenario the `OpenSearch-bot` is designed to address, you will need to install your own GitHub App on your base repo as well as on a fork of this repo belonging to a different owner. To create this forked repo, you will need to use a second GitHub account.

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

### Install Your App

As mentioned 

