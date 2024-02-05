# Openshift Config Map

`sims-pipeline-config.json` is a working sample of the config map that should be created in each openshift environment.

Note: The exact values in the sample config map may fall out of sync with what is in OpenShift, as changes are made organically directly in OpenShift.

**Note: Config maps should never contain secrets, passwords, or other sensitive values. They are not protected in OpenShift and their values may appear in logs, etc. Sensitive data should always be stored in Openshift secrets.**

## Create Config Map in Openshift

Under `Workloads` -> `ConfigMaps`

- **name:** `sims-pipeline-config`
  - **key:** `config`
  - **value:** A JSON object containing the config map settings.
