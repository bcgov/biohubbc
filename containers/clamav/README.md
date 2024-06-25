# ClamAV

ClamAV® is an open source antivirus engine for detecting trojans, viruses, malware & other malicious threats.

See this repo for the OpenShift templates needed to deploy ClamAV: https://github.com/bcgov/clamav

The source repo should be used as it will have the latest versions, etc.  
Note: at the time of writing this, the `clamav-dc.conf` in the source repo has the `IMAGE_NAMESPACE` variable hard-coded to a random project, which will need to be updated to this projects tools environment. Similarly, depending on the current version of OpenShift, some of the `apiVersion` in the build config and/or deploy config may be out of date and need updating.

A copy of the templates patched templates (converted to yaml) are included here as backup, in case the source repo is moved or becomes unavailable.

## Installation

### Checkout the clamav repo.

### Import the Build Config

1. Log into OpenShift
2. Switch to your tools environment.

   ```
   oc project <name>-tools
   ```

3. Navigate to the `<clamav_repo>/openshift/templates` folder
4. Import the clamav build config (clamav-bc.yaml)

   ```
   oc process -f clamav-bc.conf | oc create -f -
   ```

   This will create a new BuildConfig (`clamav-build`) and ImageStream (`clamav`).

#### Build the Image

1. Run the build

   ```
   OpenShift Web UI (Administrator) -> Builds -> BuildConfigs -> clamav-build -> Actions -> Start build
   ```

   This will build the image, adding a new tag to the `clamav` ImageStream (`clamav:latest`)

### Import the Deployment Config

1. Log into OpenShift
2. Switch to your dev environment.

   ```
   oc project <name>-dev
   ```

3. Navigate to the `<clamav_repo>/openshift/templates` folder
4. Import the clamav deployment config (clamav-dc.yaml)

   ```
   oc process -f clamav-dc.conf | oc create -f -
   ```

   This will create a new DeploymentConfig (`clamav`) and Service (`clamav`).

#### Deploy the Image

1. Deploy the image

   ```
   OpenShift Web UI (Administrator) -> Workloads -> DeploymentConfigs -> clamav -> Actions -> Start Rollout
   ```

   This will deploy a Pod running the ClamaAV image.

#### Repeat for the Test and Prod environments

## Testing Files For Viruses Against ClamAV

See NPM Package: [clamscan](https://www.npmjs.com/package/clamscan)

When creating a new instance of clamscan, the default Host and Port of the above installation are:

- Host: `clamav`
- Port: `3310`
