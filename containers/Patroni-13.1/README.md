# TL;DR

This repo contains the Platform Service (PS) and community maintained version of PostgreSQL managed by Patroni for High Availability (HA). You will find this image in the `bcgov` namespace on all PS managed clusters.

```console
oc get is -n bcgov
```

You will find a sample of how to deploy the image [here](./samples/README.md).

# Image Management

This image is based on PostgreSQL v13.1. It will be periodically rebuilt acording to the `cron` schedule in the workflow. When it is rebuilt, [patch](https://semver.org/) updates as well as operating security fixes will be incorporated and redistributed to all clusters via the [stable tag](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-image-tag-version).

## Tags

The stable tag for this image is `13.1`. When the image is rebuilt [patch](https://semver.org/) updates to PostgreSQL will be incorporated along with operating system updates.

See the [release notes](./RELEASE.md) for more information and any other unique tags. 

## Usage

Below is a sample of how you might reference this image from a `StatefulSet` deployment manifest. 

```yaml
  image: image-registry.openshift-image-registry.svc:5000/af2668-tools/patroni-postgres:13.1
```

Find a sample StatefulSet deployment [here](./samples/README.md).

**ProTip 🤓**

Use the **internal** host for the `bcgov` image catalog; if you use the external one (contains gov.bc.ca) you'll need to authenticate.

# Build

This image is built as per the [workflow](.github/workflows/image.yaml) and the OpenShift [templates](./openshift/templates).

## Distribution

Run RBAC to create an SA and bind it to, this is done on a lab or build cluster:

```yaml
 kind: ClusterRole
 name: system:image-puller
```

Using the token from the SA above, create a docker registry secret with the appropriate credentials. For the `--docker-server` argument use the **external registry host name**.

```console
oc create secret docker-registry bcgov-tools-klab \
  --docker-server=image-registry.foo.bar.gov.bc.ca \
  --docker-username=bcgov-images-cicd \
  --docker-password=$SATOKEN \
  --docker-email=unused
```

Then allow the builder service account to access the newly minted docker credentials for pulling images:

```console
oc secrets add sa/builder secrets/bcgov-tools-klab --for=pull
```

And finally, create an `imagestreamtag` to import the image to your cluster. Again, for the `-from-image` argument use the **external registry host name**.

```console
oc create imagestreamtag patroni-postgresql:13.1 \
  --from-image=image-registry.foo.bar.gov.bc.ca /bcgov-tools/patroni-postgresql:13.1
```

Check to make sure it imported:

```console
oc get is
```

```console
oc describe is/patroni-postgresql
```
