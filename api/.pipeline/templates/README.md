# OpenShift Templates

This folder contains yaml templates for the api builds, deployments, etc.

## Prerequisites For Deploying On OpenShift

The pipeline code builds and deploys all pods/images/storage/etc needed to deploy the application. However, there are some secrets that cannot be automatically deployed (as they cannot be committed to GitHub). You must manually create and populate these secrets.

- Create Database Secret
- Create ObjectStore Secret

The included templates under `prereqs` can be imported via the "Import YAML" page in OpenShift.
