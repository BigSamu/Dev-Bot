<!-- omit in toc -->
# OpenSearch-bot

![MIT License](https://img.shields.io/badge/license-MIT-blue)
![GitHub contributors](https://img.shields.io/github/contributors/BigSamu/OpenSearch-bot)
![Coverage Badge](./badges/coverage.svg)

This project contains the source code for a GitHub App that automates the release process in OpenSearch repositories.

<!-- omit in toc -->
## Table of Contents
- [Installation](#installation)
  - [Installing on an OpenSearch Repository](#installing-on-an-opensearch-repository)
  - [Installing on Forked Repositories](#installing-on-forked-repositories)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)

## Installation

In order for the app to work as intended, it must be installed both on an OpenSearch repository as well as on any forked repositories that PRs originate from.

### Installing on an OpenSearch Repository

- Navigate to the [OpenSearch-bot](https://github.com/apps/opensearch-bot) installation page and click "Install". 
- Select the OpenSearch repository where this app will manage PRs and process changeset files.
- Follow the instructions to complete the installation.

### Installing on Forked Repositories

- In the forked OpenSearch repository, navigate to the [OpenSearch-bot](https://github.com/apps/opensearch-bot) installation page and click "Install".
- Follow the instructions to complete the installation on the forked repository.

## Features

The app works as follows:

1. **PR Changelog Processing:** When a user opens a pull request (PR) from a forked repository against an OpenSearch repository, the app scans the PR description, looking for changelog entries listed in a "Changelog" section. It then generates a changeset file from these entries and commits this file to the open PR.
   
2. **Automating Release Documentation:** When the PR is merged, the changeset file is stored in a designated directory in the base repository. At the time of a new release, the app scans this directory and uses the changeset files to generate comprehensive release notes and update the changelog with new entries.

This process ensures a streamlined and automated approach to maintaining up-to-date release documentation in OpenSearch repositories.

## Contributing

Contributions to the `OpenSearch-bot` are welcome! See our [Developer Guide](docs/DEVELOPER_GUIDE.md) for instructions on how to set up the project in your local environment. If you have any suggestions for how to improve the app, please feel free to open an issue or submit a pull request.

## License

This app is licensed under the [MIT License](LICENSE).