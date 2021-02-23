# OpenShift Postgresql + PostGIS + PGRouting #
This repository can be used to build a container featuring Postgresql and PostGIS and PGRouting extensions.

## Versions ##
PostgreSQL versions currently supported are:

- postgresql-12.5

PostGIS versions currently supported are:

| Extension | Version | Description |
| ------------- |:-------------:| :-----|
[postgis](https://postgis.net/) | 3.1.1 | PostGIS geometry, geography, and raster spatial types |
[postgis_raster](https://trac.osgeo.org/postgis/wiki/WKTRaster) | 3.1.1 | Part of postgis: implements the RASTER type as much as possible like the GEOMETRY type is implemented in PostGIS and to offer a single set of overlay SQL functions (like ST_Intersects) operating seamlessly on vector and raster coverages.
[postgis_topology](https://postgis.net/docs/manual-dev/Topology.html) | 3.1.1 | Types and functions that are used to manage topological objects such as faces, edges and nodes |
[postgis_sfcgal](https://postgis.net/docs/reference.html#reference_sfcgal) | 3.1.1 | Provides standard compliant geometry types and operations |
[pgrouting](https://pgrouting.org/) | 3.1.2 | Provides geospatial routing functionality |

Other extensions:
| Extension | Version | Description |
| ------------- |:-------------:| :-----|
fuzzystrmatch | 1.1 | Provides several functions to determine similarities and distance between strings |
pgcrypto | 1.3 | provides cryptographic functions for PostgreSQL |

RHEL versions currently supported are:
- RHEL7

### Use RHEL7 based image: ###

RHEL7 based image

To build the RHEL7 image you need to setup entitlement and subscription manager configurations.  In the BC OCP3 cluster this was transparent.  In the BC OCP4 cluster this (currently) requires a little extra work.  Platform services will have to provision the required resources into your build environment.  Once in place a build configuration based on  [postgresql12-postgis31-oracle-fdw.bc.yaml](./openshift/postgresql12-postgis31-oracle-fdw.bc.yaml) will mount the resources so they are in place for the Dockerfile.  

Additional information can be found here; [Build Entitlements](https://github.com/BCDevOps/OpenShift4-Migration/issues/15)

## Source ##

The following open source project was used as a starting point:

https://github.com/sclorg/postgresql-container/tree/master

Refer to the above URL for a reference to the environment variables necessary to configure PostgreSQL.

*NOTE*: This is meant for BC Gov Openshift (OCP4) Builds, as access to Redhat images requires certificates and tokens that are set up on OpenShift.

## License

Code released under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
