# Header Structure Crawler

This Chrome extension crawls the current site's internal pages and lists all header tags (H1–H6) in a separate summary view.

## Features
- Activated by clicking the extension icon.
- Collects links on the current page and follows only internal links.
- Fetches the HTML for each page and extracts titles, meta descriptions, and headers.
- Opens a new tab showing a collapsible summary of each page's header structure.
- Includes a basic filter box to quickly find URLs in the summary.

## Installation
1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top right.
4. Click **Load unpacked** and select this repository's directory.

## Usage
1. Visit any website you want to analyze.
2. Click the extension's icon.
3. A new tab will appear listing each internal page and its headers.

## File Overview
- `manifest.json` – Extension configuration (Manifest V3).
- `background.js` – Injects the crawler when the icon is clicked.
- `crawler.js` – Content script that performs the crawl and builds the summary.
- `README.md` – Documentation and usage instructions.

## Extending the Extension
- Adjust filters in `crawler.js` to include or exclude different link patterns.
- Modify the generated HTML in `buildSummaryHTML` for a different look and feel.
- Add caching or persistent storage using `chrome.storage` if desired.
