#!/bin/bash

# Script to move unpushed commits from master to a new feature branch
# This script will:
# 1. Create a new branch with all current commits
# 2. Reset master to match the remote
# 3. Switch to the new feature branch

set -euo pipefail  # Exit on error, undefined variables, pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log() {
    local color=$1
    shift
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] $*${NC}"
}

# Function to exit with error
die() {
    log $RED "ERROR: $*"
    exit 1
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    die "Not in a git repository"
fi

log $BLUE "Starting process to move unpushed commits to a new branch..."

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log $YELLOW "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    die "You must be on the main branch. Current branch is: $CURRENT_BRANCH"
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    die "You have uncommitted changes. Please commit or stash them first."
fi

# Get the number of unpushed commits
UNPUSHED_COUNT=$(git rev-list --count origin/main..main)
log $YELLOW "Number of unpushed commits: $UNPUSHED_COUNT"

if [ "$UNPUSHED_COUNT" -eq 0 ]; then
    log $GREEN "No unpushed commits found. Nothing to do."
    exit 0
fi

# Show the commits that will be moved
log $BLUE "Commits that will be moved to the new branch:"
git log --oneline origin/main..main

# Ask for branch name
read -p "Enter name for the new feature branch: " FEATURE_BRANCH

# Validate branch name
if [ -z "$FEATURE_BRANCH" ]; then
    die "Branch name cannot be empty"
fi

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/$FEATURE_BRANCH; then
    die "Branch '$FEATURE_BRANCH' already exists"
fi

# Create backup tag just in case
BACKUP_TAG="backup-main-$(date +%Y%m%d-%H%M%S)"
log $YELLOW "Creating backup tag: $BACKUP_TAG"
git tag $BACKUP_TAG || die "Failed to create backup tag"

# Create the new branch from current main
log $BLUE "Creating new branch '$FEATURE_BRANCH' from current main..."
git branch $FEATURE_BRANCH || die "Failed to create branch '$FEATURE_BRANCH'"
log $GREEN "✓ Branch '$FEATURE_BRANCH' created successfully"

# Reset main to match origin/main
log $BLUE "Resetting main to match origin/main..."
git reset --hard origin/main || die "Failed to reset main"
log $GREEN "✓ Main branch reset to match origin/main"

# Switch to the new feature branch
log $BLUE "Switching to branch '$FEATURE_BRANCH'..."
git checkout $FEATURE_BRANCH || die "Failed to switch to branch '$FEATURE_BRANCH'"
log $GREEN "✓ Switched to branch '$FEATURE_BRANCH'"

# Verify the operation
NEW_BRANCH_COMMITS=$(git rev-list --count origin/main..HEAD)
log $BLUE "Verification:"
log $YELLOW "  - Current branch: $(git rev-parse --abbrev-ref HEAD)"
log $YELLOW "  - Commits on feature branch: $NEW_BRANCH_COMMITS"
log $YELLOW "  - Backup tag created: $BACKUP_TAG"

if [ "$NEW_BRANCH_COMMITS" -eq "$UNPUSHED_COUNT" ]; then
    log $GREEN "✓ SUCCESS: All $UNPUSHED_COUNT commits have been moved to '$FEATURE_BRANCH'"
    log $GREEN "✓ Main is now clean and matches origin/main"
    echo ""
    log $BLUE "Next steps:"
    echo "  1. Continue working on branch '$FEATURE_BRANCH'"
    echo "  2. When ready, push with: git push -u origin $FEATURE_BRANCH"
    echo "  3. Create a pull request to merge back to main"
    echo ""
    log $YELLOW "If something went wrong, you can restore using:"
    echo "  git checkout main && git reset --hard $BACKUP_TAG"
else
    die "Verification failed: Expected $UNPUSHED_COUNT commits but found $NEW_BRANCH_COMMITS"
fi