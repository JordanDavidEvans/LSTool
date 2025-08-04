# LSTool QA Explorer

This repository contains a modular Chrome extension for website QA. Modules can be added to extend functionality. The included **Recursive Crawler** module traverses internal pages of the current site, collects HTML, and collates the results into a local report.

## Usage
1. Load the extension in Chrome's developer mode.
2. Navigate to a site, choose a module in the popup, and click **Run**.
3. For the crawler module, a report page opens showing a summary of header counts for each internal page.

## Adding modules
- Create a new file in the `modules/` directory that exports an `id`, `name`, and `run` function.
- Import the module in `modules/index.js` so it appears in the popup menu.
