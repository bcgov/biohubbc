# Openshift Config Map

`sims-pipeline-config.json` is a sample of the config map that should be created in each openshift environment.

It is not guaranteed to contain the correct values.

The config map is validated at build time against the `PipelineConfigMapSchema` zod schema, which should always be kept up to date. See `configMapSchema.js` in each of the api, app, and database `/.pipeline` folders.

**Note: This config map should never contain secrets, passwords, or other sensitive values. Those should always be stored in Openshift secrets.**

## Create Config Map in Openshift

Under `Workloads` -> `ConfigMaps`

- **name:** `sims-pipeline-config`
  - **key:** `config`
  - **value:** A JSON object containing the config map settings.
