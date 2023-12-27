
<!-- omit in toc -->
# OpenSearch-bot

![MIT License](https://img.shields.io/badge/license-MIT-blue)
![GitHub contributors](https://img.shields.io/github/contributors/BigSamu/OpenSearch-bot)
![Coverage Badge](./badges/coverage.svg)

This project contains the source code for a GitHub App that automates the release process in OpenSearch repositories.

<left>
  <img src="./assets/OpenSearch-bot-logo.png" alt="OpenSearch-bot Logo" width="180" height="180">
</left>

<!-- omit in toc -->
## Table of Contents
- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
- [Acknowledgements](#acknowledgements)
- [Contributing](#contributing)
- [License](#license)

## Installation

In order for the app to work as intended, it must be installed both on an OpenSearch repository as well as on any forked repositories that PRs originate from.

<!-- omit from toc -->
### Installing on an OpenSearch Repository

- Navigate to the [OpenSearch-bot](https://github.com/apps/opensearch-bot) installation page and click "Install".
- Select the OpenSearch repository where this app will manage PRs and process changeset files.
- Follow the instructions to complete the installation.

<!-- omit from toc -->
### Installing on Forked Repositories

- In the forked OpenSearch repository, navigate to the [OpenSearch-bot](https://github.com/apps/opensearch-bot) installation page and click "Install".
- Follow the instructions to complete the installation on the forked repository.

## Features

The app works as follows:

1. **PR Changelog Processing:** When a user opens or edits a pull request (PR) from a forked repository against an OpenSearch repository, the app scans the PR description, looking for changelog entries listed in a "Changelog" section. It then generates a changeset file from these entries and commits this file to the open PR.

2. **Automating Release Documentation:** When the PR is merged, the changeset file is stored in a designated directory in the base repository. At the time of a new release, the app scans this directory and uses the changeset files to generate comprehensive release notes and update the changelog with new entries.

This process ensures a streamlined and automated approach to maintaining up-to-date release documentation in OpenSearch repositories.

For a more detailed walkthrough of the `OpenSearch-bot` app's features, see our [Feature Details](docs/FEATURE_DETAILS.md) document.

## Usage

In order for this app to work as intended, whenever a PR is opened from an OpenSearch fork against the base repository, the PR description must include a `## Changelog` heading.

Beneath this heading is where you will add a changelog entry or entries summarizing your contribution.

In order for the app to parse your entries and generate changeset files, each entry must:

- begin with a hyphen followed by a space ("- ")
- include one of the following category prefixes, followed by a colon:
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
- conclude with a description of your contribution in the imperative mood using no more than 100 characters

If the changes introduced in your PR are minor (e.g., fixing a typo), you can enter `- skip` in the "Changelog" section to instruct the app not to generate a changeset file. Please note that, if you enter `-skip` in the "Changelog" section, no other categories or descriptions can be present.

Here is an example of a properly-formatted changelog entry in a PR description:

```markdown
## Changelog

- feat: Add new feature
```

The app is equipped with robust error handling so that, if your PR description lacks the required information or needs reformatting in some way, the process will terminate and a comment will be added to your PR explaining what needs to be fixed.

## Acknowledgements

This app was developed by [Samuel Valdes Gutierrez](https://github.com/BigSamu), [Johnathon Bowers](https://github.com/JohnathonBowers), [Qiwen Li](https://github.com/MadaniKK), and [Will Yang](https://github.com/CMDWillYang), under the supervision of [Josh Romero](https://github.com/joshuarrrr), [Ashwin P. Chandran](https://github.com/ashwin-pc), [Matt Provost](https://github.com/BSFishy), and [Anan Zhuang](https://github.com/ananzh).

## Contributing

Contributions to the `OpenSearch-bot` are welcome! See our [Developer Guide](docs/DEVELOPER_GUIDE.md) for instructions on how to set up the project in your local environment. If you have any suggestions for how to improve the app, please feel free to open an issue or submit a pull request.

## License

This app is licensed under the [MIT License](LICENSE).
