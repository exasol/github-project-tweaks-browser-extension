# GitHub Project Tweaks Browser Extension

This browser extension adds some features to the GitHub projects and project boards that at the time of the creation of the extension where missing.

For example a work-in-progress (WiP) limit.

Best case scenario this extension will be obsolete one day because GitHub offers the features out of the box.

## Features

* Highlight a column on a GitHub projects board if the work-in-progress limit is exceeded.

## Runtime Dependencies

* Requires Firefox
* No external libraries necessary
* No special permissions required

## Privacy

The "GitHub Project Tweaks" browser extension does not collect any data, private or otherwise. No tracking information, usage data or other metadata.

To operate, the extension reads the page structure of the GitHub project boards you load in your browser, in order to be able to improve the way the page is presented (e.g. by highlighting a board column where the work-in-progress limit is exceeded). The change in content is limited to your browser instance.

The extension does not have a home server. Communication stays between the servers of the page you are browsing and your browser instance.

## Documentation for Users

* [User Guide](doc/user_guide/user_guide.md)
* [Changes](doc/changes/changelog.md)

## Documentation for Devleopers

The [Developer Guide](doc/developer_guide/developer_guide.md) contains information about how to build and test the extension.