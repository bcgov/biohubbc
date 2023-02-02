# ClamAV

ClamAV® is an open source antivirus engine for detecting trojans, viruses, malware & other malicious threats.

This is a repo setup for utilization in Red Hat Openshift. This solution allows you to create a pod in your openshift environment to scan any file for known virus signatures, quickly and effectively.

The builds package the barebones service, and the deployment config will download latest signatures on first run.

Freshclam can be run within the container at any time to update the existing signatures. Alternatively, you can re-deploy which will fetch the latest into the running container.

This clamav setup is cloned from the repo: https://github.com/bcgov/clamav

## Prerequisites For Deploying On OpenShift

### Import Base Image for `ubi8/ubi` Used By `clamav-bc.yaml`

- Fetch latest version

  ```
  oc import-image ubi8/ubi:latest --from=registry.access.redhat.com/ubi8/ubi:latest --confirm
  ```

Openshift documentation on importing images

- https://catalog.redhat.com/software/containers/ubi8/ubi/5c359854d70cc534b3a3784e?tag=latest&push_date=1673532745000&architecture=amd64&container-tabs=gti&gti-tabs=unauthenticated

  - See `oc import-image` command

## Build/Deployment

The templates in the `./openshift/templates` will build and deploy the app. Modify to suit your own environment.

The build config `./openshift/templates/clamav-bc.yaml` will create your builder image (ideally in your tools project), and the deployment config `./openshift/templates/clamav-dc.yaml` will create the pod deployment.

Modify the environment variables defined in both the build config and deployment config appropriately.
