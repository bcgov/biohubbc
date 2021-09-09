![Image of ClamAV](https://www.clamav.net/assets/clamav-trademark.png)
# ClamAV 

ClamAV® is an open source antivirus engine for detecting trojans, viruses, malware & other malicious threats.

This is a repo setup for utilization in Red Hat Openshift.  This solution allows you to create a pod in your openshift environment to scan any file for known virus signatures, quickly and effectively.

The builds package the barebones service, and the deployment config will download latest signatures on first run.

Freshclam can be run within the container at any time to update the existing signatures.  Alternatively, you can re-deploy which will fetch the latest into the running container.

# Deployment

The templates in the [openshift/templates](./openshift/templates) will build and deploy the app.  Modify to suit your own environment.  [openshift/templates/clamav-bc.yaml](./openshift/templates/clamav-bc.yaml) will create your builder image (ideally in your tools project), and [openshift/templates/clamav-dc.yaml](./openshift/templates/clamav-dc.yaml) will create the pod deployment.  Modify the environment variables defined in both the build config and deployment config appropriately.
