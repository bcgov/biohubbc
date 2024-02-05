# Openshift Config Map

`sims-pipeline-config.json` is a sample of the config map that should be created in each openshift environment.

`sims.configmap.yaml` is a fully defined config map yaml which can be imported into OpenShift when first creating the config map. Edits can be made against the existing config map in OpenShift, but should also be captured here for future use and backup.

The config map is validated at build and deployment time against the `PipelineConfigMapSchema` zod schema, which should always be kept up to date. See `configMapSchema.js`.

**Note: Config maps should never contain secrets, passwords, or other sensitive values. They are not protected in OpenShift and their values may appear in logs, etc. Sensitive data should always be stored in Openshift secrets.**

## Create Config Map in Openshift

Under `Workloads` -> `ConfigMaps`

- **name:** `sims-pipeline-config`
  - **key:** `config`
  - **value:** A JSON object containing the config map settings.
