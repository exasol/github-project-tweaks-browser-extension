#!/bin/bash
# This simple build script determines the version number from the Manifest (to avoid
# inconsistencies) and packs the files that make up the extension into a ZIP archive with an '.xpi'
# suffix.

set -o errexit
set -o nounset
set -o pipefail

readonly SOURCE_DIR="src"
readonly BUILD_DIR="build"
readonly MANIFEST="$SOURCE_DIR/manifest.json"

# Parse the version number from the manifest file:
get_version_from_manifest() {
  grep '"version":' "$MANIFEST" | sed -e's/.*: *"//' -e's/".*//'
}

clean_build_dir() {
  if [[ -d "$BUILD_DIR" ]] && [[ "$(ls -A $BUILD_DIR)" ]]
  then
    echo "Cleaning up build directory '$BUILD_DIR'."
    rm "$BUILD_DIR/*"
  fi
}

VERSION=$(get_version_from_manifest); readonly VERSION
readonly EXTENSION_ARCHIVE="$BUILD_DIR/github_project_tweaks_$VERSION.xpi"

mkdir -p "$BUILD_DIR"

clean_build_dir

echo "Packing extension files into archive '$EXTENSION_ARCHIVE'."

cd "$SOURCE_DIR"
zip "../$EXTENSION_ARCHIVE" *
