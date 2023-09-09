# html-class-sorter

# GitHub Marketplace Bot for Sorting CSS Classes in HTML

## Overview

This GitHub bot automatically sorts your HTML classes and ensures your codebase remains consistent and clean.
It utilizes TypeScript to achieve efficient and reliable sorting.

## Features

- Sorts utility class prefixes based on predefined rules.
- Encodes CSS utility classes for easy identification.
- Automatically opens a pull request with sorted classes whenever you push HTML files to your repository.

## Installation

1. Visit the GitHub Marketplace and find our bot listed under "Code Quality."
2. Select the repository where you want the bot to run.
3. Complete the installation process by authorizing the bot to access your repository.

## How It Works

- When any pull request merges to the main branch, the bot scans the changed HTML, JSX, ... files.
- It then sorts the utility class prefixes according to predefined rules.
- A new pull request is created with the sorted classes, ready for review and merge.

## Permissions

The bot will need read and write access to the code in your repository to scan HTML files and open pull requests.

## Contributing

If you have suggestions for how html-class-sorter could be improved, or want to report a bug, open an issue!
We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2023 Lygom
