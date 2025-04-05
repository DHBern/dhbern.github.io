# dhbern.github.io

This repository contains the website of the Digital Humanities at the University of Bern. The data in this repository is openly available to everyone and is intended to support reproducible research.

[![GitHub issues](https://img.shields.io/github/issues/DHBern/dhbern.github.io.svg)](https://github.com/DHBern/dhbern.github.io/issues) [![GitHub forks](https://img.shields.io/github/forks/DHBern/dhbern.github.io.svg)](https://github.com/DHBern/dhbern.github.io/network) [![GitHub stars](https://img.shields.io/github/stars/DHBern/dhbern.github.io.svg)](https://github.com/DHBern/dhbern.github.io/stargazers) [![Code license](https://img.shields.io/github/license/DHBern/dhbern.github.io.svg)](https://github.com/DHBern/dhbern.github.io/blob/main/LICENSE-AGPL.md) [![Data license](https://img.shields.io/github/license/DHBern/dhbern.github.io.svg)](https://github.com/DHBern/dhbern.github.io/blob/main/LICENSE-CCBY.md)

<!-- [![DOI](https://zenodo.org/badge/ZENODO_RECORD.svg)](https://zenodo.org/badge/latestdoi/ZENODO_RECORD) -->

## Repository Structure

The structure of this repository follows the [Advanced Structure for Data Analysis](https://the-turing-way.netlify.app/project-design/project-repo/project-repo-advanced.html) of _The Turing Way_ and is organized as follows:

- `.github/` - Contains the GitHub configuration files, including the issue templates and workflows.
- `.husky/` - Contains the Husky configuration files, including the pre-commit hooks and the Husky settings.
- `.venv/` - Contains the Python virtual environment used to build the website, including the Python packages and their versions.
- `assets/` - Contains all the assets used in the website, including images, stylesheets, and JavaScript files.
- `content/` - Contains the content of the website, including the main page and any additional pages.
- `renv/` - Contains the R environment used to build the website, including the R packages and their versions.

## Installation

Use Codespace to set up your environment quickly and easily. Codespaces are cloud-based development environments that allow you to run and edit code directly in your browser. This is the recommended way to set up your environment.

<details>

<summary>Follow these instructions to set up your environment locally (advanced)</summary>

### Prerequisites

Make sure you have the following software installed:

- **Node.js**: [Installation Guide](https://nodejs.org/en/download/)
- **R (incl. Rtools)**: [CRAN Installation Guide](https://cran.r-project.org/)
- **uv**: [Installation Guide](https://github.com/astral-sh/uv#installation)
- **Quarto**: [Installation Guide](https://quarto.org/docs/get-started/)

Note: uv will automatically install and manage a Python version if one isn't available.

### Setup the project

Clone the repository and navigate to its root directory, then:

#### Linux and macOS

1.  Install Node.js dependencies:

```bash
npm install
```

2.  Setup Python environment with uv:

```bash
uv sync
```

3.  Setup R environment with renv:

```bash
Rscript -e 'install.packages("renv"); renv::restore()'
```

4.  Check installation by previewing the documentation:

```bash
uv run quarto preview
```

#### Windows

1.  Install Node.js dependencies:

```powershell
npm install
```

2.  Setup Python environment with uv:

```powershell
uv sync
```

3.  Setup R environment with renv:

```powershell
Rscript -e "install.packages('renv'); renv::restore()"
```

4.  Check installation by previewing the documentation:

```powershell
uv run quarto preview
```

Now, your environment should be fully configured and ready to use.

</details>

## Use

Check that all files are properly formatted.

```bash
npm run check
```

Format all files.

```bash
npm run format
```

Run the wizard to write meaningful commit messages.

```bash
npm run commit
```

Run the wizard to create a CHANGELOG.md.

```bash
npm run changelog
```

Preview the documentation.

```bash
uv run quarto preview
```

## Support

This project is maintained by [\@DHBern](https://github.com/DHBern). Please understand that we can't provide individual support via email. We also believe that help is much more valuable when it's shared publicly, so more people can benefit from it.

| Type                                   | Platforms                                                                    |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| 🚨 **Bug Reports**                     | [GitHub Issue Tracker](https://github.com/DHBern/dhbern.github.io/issues)    |
| 📊 **Report bad data**                 | [GitHub Issue Tracker](https://github.com/DHBern/dhbern.github.io/issues)    |
| 📚 **Docs Issue**                      | [GitHub Issue Tracker](https://github.com/DHBern/dhbern.github.io/issues)    |
| 🎁 **Feature Requests**                | [GitHub Issue Tracker](https://github.com/DHBern/dhbern.github.io/issues)    |
| 🛡 **Report a security vulnerability** | See [SECURITY.md](SECURITY.md)                                               |
| 💬 **General Questions**               | [GitHub Discussions](https://github.com/DHBern/dhbern.github.io/discussions) |

## Roadmap

TBA

## Contributing

All contributions to this repository are welcome! If you find errors or problems with the data, or if you want to add new data or features, please open an issue or pull request. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Versioning

We use [SemVer](http://semver.org/) for versioning. The available versions are listed in the [tags on this repository](https://github.com/DHBern/dhbern.github.io/tags).

## Authors and acknowledgment

- **Moritz Mähr** - _Initial work_ - [maehr](https://github.com/maehr)

See also the list of [contributors](https://github.com/DHBern/dhbern.github.io/graphs/contributors) who contributed to this project.

## License

The data in this repository is released under the Creative Commons Attribution 4.0 International (CC BY 4.0) License - see the [LICENSE-CCBY](LICENSE-CCBY.md) file for details. By using this data, you agree to give appropriate credit to the original author(s) and to indicate if any modifications have been made.

The code in this repository is released under the GNU Affero General Public License v3.0 - see the [LICENSE-AGPL](LICENSE-AGPL.md) file for details. By using this code, you agree to make any modifications available under the same license.
