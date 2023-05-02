# Pod Management

## When a pod fails to build or deploy repeatedly

### Drop the pods for a clean build and deploy

This typically happens for the db-setup pod when migrations are in flux.

For example: Cypress Pod failed

![Failed cypress pod](./images/FailedPod.png)

Log into openshift

```
https://console.apps.silver.devops.gov.bc.ca/k8s/cluster/projects
```

Select project: af2668-dev

Find your PR number (the example beloow shows PR numbers in yellow):

![Failed cypress pod](./images/FindPRNumber.png)

## Drop your pods

From openshift, grab your login credentials
![Grab openshift login cmd](./images/OpenshiftLoginCmd.png)

### You'll see your project list

ensure the asterix is next to af2668.

If not, use `oc get project <project_name>` to switch to the intended project. Use `oc projects` to confirm the correct project is selected.

The following command will delete all pods secrets and persistent volumes related to your PR instance.

```
oc delete all,secret,pvc --selector env-id=<enter_your_PR_number_here>
```

This may take a couple of minutes to finish.

Caution: Make sure you specify the correct PR number in the above command and are on the correct OpenShift environment (Dev)
