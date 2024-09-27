# Database

## Crunchy Postgres + Postgis Image

### Redhat Image

- https://catalog.redhat.com/software/containers/crunchydata/crunchy-postgres-gis/595e572a1fbe9833203fa18c?image=66c497fad35ce5e27a4321f1&architecture=amd64

### Supported Environment Variables

- https://access.crunchydata.com/documentation/crunchy-postgres-containers/5.3.1/container-specifications/crunchy-postgres/postgres/
- https://github.com/CrunchyData/crunchy-containers/blob/master/docs/content/container-specifications/crunchy-postgres/postgres.md

## Database Pipeline Pre-reqs

### 1. Import the base crunchy postgres image into Openshift.

See `database/.pipeline/db.bc.yaml` for expected `POSTGRES_IMAGE_NAME` and `POSTGRES_IMAGE_VERSION`.  
See `README/Openshift.md` for how to import images.
