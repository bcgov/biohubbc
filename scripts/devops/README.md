# devops

A collection of devops related scripts.

## Pre-reqs

- Must already be logged into the Openshift environment in your local terminal (copy API token through OpenShift web gui).
  ```bash
  oc login --token=<secret> --server=https://api.silver.devops.gov.bc.ca:6443
  ```
- Install `jq`
  ```bash
  curl -L -o /usr/bin/jq.exe https://github.com/stedolan/jq/releases/latest/download/jq-win64.exe
  ```

## sims-imagestreamtag-cleanup.sh

Deletes all image stream tags in the SIMS tools environment, except for:

- Those with a matching PR (based on the github pr # matching the number in the image name)
- The most recent 30 image stream tags
- The most recent 5 image stream tags that end in '-dev'
- The most recent 5 image stream tags that end in '-test'
- The most recent 5 image stream tags that end in '-prod'

### Why do we need this script?

Images take up hard drive space, and over time we will consume the available space allocated to us.
We need to periodically prune the old images to prevent this. This could be automated, but currently it is not. If we use too much space, the platform team will email us requesting we clear up space.

## sims-imagestreamtag-cleanup.sh

Deletes all PR-based resources in the SIMS tools/dev environment for PRs that are not open. This includes PRs that were merged, and PRs that were closed (based on the github pr # matching the number in the image name)

Will delete resources if:

- It has a label `env-id=<pr #>`.
- The `<pr #>` is for a closed or merged PR in GitHub.
- The resource does NOT have the word 'test' or 'prod' in the name.

### Why do we need this script?

The Git Actions have a cleanup step that runs when a PR is merged or closed. However, it can sometimes fail to work correctly for any number of reasons. In order to free-up Openshift resources, we should periodically run this script to ensure old PR resources aren't still running and consuming our limited CPU/Ram.

## Notes

To dry-run these scripts, change the `oc delete` to `oc select`, and optionally comment out the `rm ...` line, so that you can inspect the temp files it produces.
