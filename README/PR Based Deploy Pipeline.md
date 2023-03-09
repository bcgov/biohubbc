# PR Based Deploy Pipeline

# Duplicate Action Skipping

The PR-Based Deployment workflow will attempt to skip jobs if it determines that no new code changes have been made since the last successful run.

### Example:

- The PR-Based Deploy workflow runs successfully.
- A new commit is pushed that only changes the APP.
- The PR-Base Deploy workflow runs again.
  - The API, Database, and Database Setup jobs are skipped, because they have no new changes.
  - The APP job is not skipped, and does a new build and deploy, because there are new changes.

## Bypass Duplicate Action Skipping

You may want to bypass the duplicate action skipping logic, and force a full re-run of the PR-Based Deploy workflow.

In this case, include the keyword `ignore-skip` anywhere in the message of a commit, and when the PR-Based Deploy workflow runs, it will identify the existence of the keyword `ignore-skip` and prevent any jobs from being skipped.

_Note: this only works for the workflow run kicked off by this specific commit. Subsequent commits that do not include `ignore-skip` will revert back to the normal duplicate action skipping logic._
