# ![Extension icon](src/icon_48.png) GitHub Project Tweaks Browser Extension

This browser extension adds some features to the GitHub projects and project boards that at the time of the creation of the extension where missing.

For example a work-in-progress (WiP) limit.

Best case scenario this extension will be obsolete one day because GitHub offers the features out of the box.

## Features

* Highlight a column on a GitHub projects board if the work-in-progress limit is exceeded.
   ![WiP Limit Exceeded](doc/developer_guide/wip-limit_exceeded.png)

## Roadmap

- [x] [0.1.0](doc/changes/changes_0.1.0.md): WiP limits
- [ ] [0.2.0](doc/changes/changes_0.2.0.md): Helper for converting duration strings to days (and fractions of days)
- [ ] 1.0.0: Auto-link ticket references for faster access to tickets outside GitHub

## Runtime Dependencies

* Requires Firefox
* No external libraries necessary
* No special permissions required

## Installation

* Surf to https://addons.mozilla.org/en-US/firefox/addon/github-project-tweaks/
* Click "Add to Firefox"

## Privacy

The "GitHub Project Tweaks" browser extension does not collect or store any data.

The data that is processed between the servers hosting the website you are browsing and your browser instance itself.

For the extension to operate, it reads the page structure of the GitHub projects you access via the browser.

## Documentation for Users

* [User Guide](doc/user_guide/user_guide.md)
* [Changes](doc/changes/changelog.md)

## Documentation for Devleopers

The [Developer Guide](doc/developer_guide/developer_guide.md) contains information about how to build and test the extension.
