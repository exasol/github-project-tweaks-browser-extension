#!/bin/bash
# This simple build script determines the version number from the Manifest (to avoid
# inconsistencies) and packs the files that make up the extension into a ZIP archive with an '.xpi'
# suffix.

set -o errexit
set -o nounset
set -o pipefail

readonly BUILD_DIR="build"
readonly MANIFEST='manifest.json'

# Parse the version number from the manifest file:
get_version_from_manifest() {
    grep '"version":' "$MANIFEST" | sed -e's/.*: *"//' -e's/".*//'
}

VERSION=$(get_version_from_manifest); readonly VERSION
readonly EXTENSION_ARCHIVE="$BUILD_DIR/github_project_tweaks_$VERSION.xpi"

mkdir -p "$BUILD_DIR"

echo "Packing extension files into archive '$EXTENSION_ARCHIVE'."

zip "$EXTENSION_ARCHIVE" manifest.json github_project_tweaks.js icon*.png