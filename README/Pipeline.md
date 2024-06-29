# Pipeline Readme

## Troubleshooting

### Your cache folder contains root-owned files, due to a bug in previous versions of which has since been addressed.

```Bash
npm ERR! code EACCES
npm ERR! sysca11 open
npm ERR! path /opt/app—root/src/
npm ERR! errno —13
npm ERR!
npm ERR! Your cache folder contains files, due to a bug in
npm ERR! previous versions of which has since been addressed.
npm ERR!
npm ERR! To fix this problem, please run:
npm ERR! sudo cho•m -R "/opt/app-root/src/.npn"
```

#### Solution Adopted By This Repo

Update api/app `Dockerfile` to a multi-stage build where the `.npm` folder is not copied from stage 1 into stage 2 AND
the application is started by calling `node <file>` rather than `npm run <command>`, thereby bypassing npm entirely.

#### Misc related documentation/threads

##### Openshift

- https://docs.openshift.com/container-platform/4.14/openshift_images/create-images.html#use-uid_create-images

##### Rocketchat

- https://chat.developer.gov.bc.ca/channel/devops-how-to/thread/vxnNGi8fJBqT6mmas
