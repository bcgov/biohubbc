# Openshift

## Useful OC Commands

### Import an image into <openshift_env>

```
oc -n <openshift_env> import-image <image_stream_name>[:<tag>] --from=<docker_image_repo> --confirm
```

### Portforward to a database pod

```
oc port-forward <pod_name> <local_port>:<pod_port>
```

### Delete pull request build/deploy resources

```
oc -n af2668-dev delete all,secret,pvc --selector env-id=<pr_number>
```
