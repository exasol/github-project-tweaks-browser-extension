# GitHub Project Tweaks Browser Extension User Guide

## Installation

TODO: https://github.com/exasol/github-project-tweaks-browser-extension/issues/3

## Configuration of the Board

In the description of a board column add a WIP limit consisting of the `≤` symbol followed by optional space and a number.

Example text:

> This is actively being worked on (≤ 10)

Here is how this looks in the browser.

![WiP Limit in colum description](wip_limit_in_column_description.png)

The browser extension will recognize that special sequence and take it as a WiP limit for this column. All columns that have no limit set or a limit of zero are considered columns to ignore.

## Exceeding the WiP Limit

When the WiP limit is exceeded, the item counter turns red and the board column is surrounded by a broad red border.

![WiP limit exceeded](wip_limit_exeeded.png)