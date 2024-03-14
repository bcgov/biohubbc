# Openshift Config Map

`sims-pipeline-config.json` is a working sample of the config map that should be created in each openshift environment.

Note: The exact values in the sample config map may fall out of sync with what is in Openshift, as changes to values are made directly in Openshift (ex: updating cpu/memory limits in OpenShift, etc).

**Note: Config maps should never contain secrets, passwords, or other sensitive values. They are not protected in OpenShift and their values may appear in logs, etc. Sensitive data should always be stored in Openshift secrets.**

## Create Config Map in Openshift

Under the target environment (dev, test, prod)

#### Option 1

Under `Workloads` -> `ConfigMaps`

1. Click `Create ConfigMap`
2. Set field values as follows:
   - **name:** `sims-pipeline-config`
   - **immutable:** `false` (leave unchecked)
   - **key:** `config`
   - **value:** A JSON object containing the config map settings.
3. Click `Create`

#### Option 2

1. Click the plus icon `(+)` in the Openshift header (next to your user name in the top right corner).
2. Copy/paste the entire contents of the sample `sims.configmap.yaml` (make changes as needed now, or update afterwards)
3. Click `Create`

## Updating Config Map in Openshift

Under the target environment (dev, test, prod)

Under `Workloads` -> `ConfigMaps`

1. Click on target config map
2. Click `Actions` -> `Edit ConfigMap`
3. Update the `value`, making changes to the JSON object as needed.
4. Click `Save`
