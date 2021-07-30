# N8N

This folder contains the OpenShift templates required in order to build and deploy an instance of N8N onto OpenShift. These templates were designed with the assumption that you will be building and deploying the N8N application within the same project. We will be running with the assumption that this N8N instance will be co-located in the same project as the database it is expecting to poll from.

## Build N8N

You are supposed to build your n8n image in your <..>-tools namespace and then when you deploy you'll re-use that image.

While N8N does provide a Docker image [here](https://hub.docker.com/r/n8nio/n8n), it is not compatible with OpenShift due to the image assuming it has root privileges. Instead, we build a simple NodeJS image based off Redhat's ubi8/nodejs-12 image where the N8N application can execute without needing privilege escalation. In order to build a N8N image in your project, process and create the build config template using the following command (replace anything in angle brackets with the correct value):

```sh
export NAMESPACE=af2668-test
export N8N_IMAGE_NAMESPACE=af2668-tools
export N8N_VERSION=0.131.0

oc process -n $NAMESPACE -f n8n.bc.yaml -p N8N_VERSION=$N8N_VERSION -p N8N_IMAGE_NAMESPACE=$N8N_IMAGE_NAMESPACE -o yaml | oc apply -n $NAMESPACE -f -
```

This will create an ImageStream called `n8n`. This image is built on top of ubi8/nodejs-12, and will have N8N installed on it.

## Deploy N8N

Once your N8N image has been successfully built, you can then deploy it in your project by using the following command (replace anything in angle brackets with the correct value):

```sh
export NAMESPACE=af2668-test
export N8N_IMAGE_NAMESPACE=af2668-tools
oc process -n $NAMESPACE -f n8n.dc.yaml NAMESPACE=$NAMESPACE -o yaml | oc apply -n $NAMESPACE -f -
```

This will create a new Secret, Service, Route, Persistent Volume Claim, and Deployment Configuration. This Deployment Config has liveliness and readiness checks built in, and handles image updates via Recreation strategy.

## Initial Setup

Once N8N is up and functional (this will take between 3 to 5 minutes), you will have to do initial setup manually. We suggest you populate the email account and password as whatever the `n8n-secret` secret contains in the `admin-user` and `admin-password` fields respectively. You may be asked to connect to your existing Postgres (or equivalent) database during this time, so you will need to refer to your other secrets or other deployment secrets in order to ensure N8N can properly connect to it via JDBC connection.

## Notes

In general, N8N should generally take up very little CPU (<0.01 cores) and float between 700 to 800mb of memory usage during operation. The template has some reasonable requests and limits set for both CPU and Memory, but you may change it should your needs be different. For inspecting the official N8N documentation [here](https://docs.n8n.io/).
