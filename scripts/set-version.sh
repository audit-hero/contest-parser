#!/bin/bash
set -e

CURRENT_VERSION=$(jq -r '.version' package.json)
NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. -v OFS=. '{print $1, $2, $3+1}')
sed -i '' 's/'$CURRENT_VERSION'/'$NEW_VERSION'/g' package.json
sed -i '' 's/version = ".*"/version = "'$NEW_VERSION'"/g' ./src/version.ts

echo "set version from $CURRENT_VERSION to $NEW_VERSION"