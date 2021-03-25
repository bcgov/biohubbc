# Running the Client

To run the client against the ClamAV server, your first need to `oc port-forward` the pods port to your local.

```
oc login <your token>
oc project <your namespace>  
oc port-forward <your pod> 3310:3310
```

# Client Examples
* `ping.js`: Makes sure you can reach your server
* `getversion.js`: Reports the version of your server
* `scandirectory.js`: Scans a directory (and all below)
* `scanfile.js`: Scans a single file
