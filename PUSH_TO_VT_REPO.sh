#!/bin/bash
# Script to push to VT Code repository

# Change the existing origin URL to point to VT Code
git remote set-url origin git@code.vt.edu:dstalreja/cs-2104-personal-programming-project.git

# Verify the change
echo "Remote URL updated. Current remotes:"
git remote -v

# Add all files
git add .

# Commit (if there are changes)
git commit -m "Initial commit" || echo "No changes to commit"

# Push to the new origin
git push --set-upstream origin main

echo "Done! Pushed to VT Code repository."


