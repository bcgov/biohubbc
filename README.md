[![img](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bcgov_biohubbc&metric=alert_status)](https://sonarcloud.io/dashboard?id=bcgov_biohubbc) [![codecov](https://codecov.io/gh/bcgov/biohubbc/branch/dev/graph/badge.svg?token=CF2ZR3T3U2)](https://codecov.io/gh/bcgov/biohubbc) [![BioHubBC](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/w8oxci/dev&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/w8oxci/runs)

# BioDiversityHub BC

Sub-project under the SEISM Capital project, the source of BC’s species inventory data.

The objectives for the BioHubBC project are:

- To provide a single source for aquatic and terrestrial species and habitat data.
- To reduce the barriers for collecting and sharing aquatic and terrestrial species and habitat data throughout the province of British Columbia.
- To reduce the effort involved with managing aquatic and terrestrial species and habitat data.
- To improve access for all stakeholders to the aquatic and terrestrial species and habitat data needed to make informed decisions and policies for the province.

# Running Locally with Docker

See `./Makefile` for all the available commands.

## Pre-reqs

### Install Docker

Note: this setup uses volumes to support live reload. You will need to ensure that you grant docker access to whichever hard-drive you are working in.

### Initialize the `./env` file.

This will copy `./env_config/env.docker` to `./.env`  
Note: this file may need additional editing to provide secrets for external services (like S3).

```
make env
```

_Note: you will need to use a terminal that supports make, etc. On Mac this is the default terminal, on Windows you can use something like `git-bash`._

## Run all projects

Builds and runs the database (including migrations/seeding), api, web and ionic apps.

```
make all
```

## Run only backend projects

Runs the database (including migrations/seeding) and api.

```
make backend
```

## Run web projects

Runs the database (including migrations/seeding), api, and web app.

```
make web
```

## Run ionic projects

Runs the database (including migrations/seeding), api, and ionic app.

```
make ionic
```

## Access the running applications

api:

- `localhost:6100/api/`
- `localhost:80/api/`

app:

- `localhost:7100`

app-ionic

- `localhost:8100`

clamav:
- `localhost:3310`

# Helpful Makefile Commands

See `./Makefile` for all available commands.  
The most common commands, other than the ones mentioned above which run the project(s).

### Close all containers

```
make close
```

### Close and delete all containers/artifacts

```
make clean
```

### Shell into a container (database, api, app)

```
make database
```

```
make api
```

```
make app
```

### Prune Docker Artifacts

This will aggressively delete docker artifacts to recover docker hard-drive space.

See [documentation](https://docs.docker.com/engine/reference/commandline/system_prune/) for OPTIONS.

```
docker system prune [OPTIONS]
```

See [documentation](https://docs.docker.com/engine/reference/commandline/volume_prune/) for OPTIONS.

```
docker volume prune [OPTIONS]
```

# Helpful Docker Commands

### Show all running containers

`docker ps`

### Show all containers (running and closed)

`docker ps -a`

### View the logs for a container

`docker logs <container id or name>`  
Include `-f` to "follow" the container logs, showing logs in real time

## Troubleshooting

If you get an error saying the `make` command is not found, you may need to install it first. Assuming you have
chocolatey installed, you can just run `choco install make`.

While trying to run a make command such as `make web`, if you encounter an issue along the lines of:

```
E: Release file for http://deb.debian.org/debian/dists/buster-updates/InRelease is not valid yet (invalid for another 1d 1h 5min 13s). Updates for this repository will not be applied.
```

it may be possible that your system clock is out of date or not synced (dockerfile timezone has to match your machine timezone).
In this case, make sure your timezone is correct and matches that of docker and restart your machine/terminal window and try again.

## Acknowledgements

[![SonarCloud](https://sonarcloud.io/images/project_badges/sonarcloud-black.svg)](https://sonarcloud.io/dashboard?id=bcgov_biohubbc)

## License

    Copyright 2019 Province of British Columbia

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
