[![img](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bcgov_biohubbc&metric=alert_status)](https://sonarcloud.io/dashboard?id=bcgov_biohubbc) [![codecov](https://codecov.io/gh/bcgov/biohubbc/branch/dev/graph/badge.svg?token=CF2ZR3T3U2)](https://codecov.io/gh/bcgov/biohubbc) [![BioHubBC](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/w8oxci/dev&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/w8oxci/runs)

# BioDiversityHub BC

Sub-project under the SEISM Capital project, the source of BC’s species inventory data.

The objectives for the BioHubBC project are:

- To provide a single source for aquatic and terrestrial species and habitat data.
- To reduce the barriers for collecting and sharing aquatic and terrestrial species and habitat data throughout the province of British Columbia.
- To reduce the effort involved with managing aquatic and terrestrial species and habitat data.
- To improve access for all stakeholders to the aquatic and terrestrial species and habitat data needed to make informed decisions and policies for the province.

# Pre-reqs

## Install Node/NPM

- Requires Node version 12+
- https://nodejs.org/en/download/

## Install Git

- https://git-scm.com/downloads

### Clone the repo

- `git clone https://github.com/bcgov/biohubbc.git`

## Install Docker

- https://www.docker.com/products/docker-desktop

### Windows

If prompted, install Docker using Hyper-V (not WSL 2)

### Grant Docker access to your local folders

This setup for biohub uses volumes to support live reload.  
To leverage live reload you will need to ensure Docker is running using Hyper-V (not the WSL2 engine).

#### MacOS

- In the Docker-Desktop app:
  - Go to settings (gear icon)
  - Now go to Resources
  - Go to File Sharing
  - Add the folder/drive your repo is cloned under
    - This will grant Docker access to the files under it, which is necessary for it to detect file changes.

#### Windows

- In the Docker-Desktop app:
  - Go to settings (gear icon)
  - On the general tab ensure that the `Use the WSL 2 based engine` is unchecked.
    - If it is checked, uncheck it, and click `Apply & Restart`
      - Docker may crash, but that is fine, you can kill docker for now.
    - You will then need to go to the following URL and follow the instructions in the first section `Enable Hyper-V using Powershell`: https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v
      - This should just consist of running the 1 command in Powershell (as Admin): `Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All`
    - Once the powershell command has been run, it will ask you to restart your machine.
    - Once restarted, re-launch Docker, and check that docker starts successfully and that the `Use the WSL 2 based engine` setting is still unchecked
  - Go to settings (gear icon)
  - Now go to Resources
  - Go to File Sharing
  - Add the folder/drive your repo is cloned under
    - This will grant Docker access to the files under it, which is necessary for it to detect file changes.

## Ensure you can run the `make` command

### MacOS

- Install make: `brew install make`
  - https://formulae.brew.sh/formula/make

### Windows

- Install chocolatey: https://chocolatey.org/install#install-step2
- Install make: `choco install make`
  - https://community.chocolatey.org/packages/make

_Note: you will need to run choco commands in a terminal as administrator_

# Configuring Local IDE

You can use any code IDE you prefer, though VSCode is recommended.

- https://code.visualstudio.com/

For convenience, you can install all node_modules by running the following command from the repo's root folder.

```
make install
```

You can also manually run `npm install` in each of the `/api/`, `/app/`, and `/database/` folders.

# Building/Running the App

_Note: Run all make commands from the root folder of the repo._

_Note: Run all commands in a terminal that supports make. On Mac you can use the default `Terminal`, on Windows you can use `git-bash`._

## Initialize the `./env` file.

This will copy `./env_config/env.docker` to `./.env`.  
This should only need to be run once.  
This file may need additional editing to provide secrets for external services (like S3).

```
make env
```

Result of running `make env` for the first time:  
![make env screenshot](readme_screenshots/running_make_env.png "Running `make env`")

## Start all BioHub Applications

Starts all applications (database, api, and web app).

```
make web
```

Result of running `make web` (condensed to only show the important parts):  
![make web screenshot](readme_screenshots/running_make_start.png "Running `make web`")

## Access the Running Applications

api:

- `localhost:6100/api/`

app:

- `localhost:7100`

# Helpful Makefile Commands

See `./Makefile` for all available commands.

_Note: Run all make commands from the root folder of the repo._

## Print Makefile Help Doc

```
make help
```

## Install All Dependencies

Will run `npm install` in each of the project folders (api, app, database).

```
make install
```

## Delete All Containers

Will stop and delete the biohub docker containers.  
This is useful when you want to clear out all database content, returning it to its initial default state.  
After you've run `make clean`, running `make web` will launch new containers, with a fresh instance of the database.

```
make clean
```

## View the logs for a container

### API

```
make log-api
```

### APP

```
make log-app
```

### Database

```
make log-db
```

### Database Setup (migrations + seeding)

```
make log-db-setup
```

## Run Linter and Fix Issues

Will run the projects code linter and attempt to fix all issues found.

_Note: Not all formatting issues can be auto-fixed._

```
make lint-fix
```

## Run Formatter and Fix Issues

Will run the projects code formatter and attempt to fix all issues found.

_Note: Not all formatting issues can be auto-fixed._

```
make format-fix
```

## Shell Into a Docker Container (database, api, app)

### Database

This is useful if you want to access the PSQL database through the CLI.  
See [DBeaver](#dbeaver) for a GUI-centric way of accessing the PSQL database.

```
make database
```

### Api

```
make api
```

### App

```
make app
```

# Helpful Docker Commands

## Show all running containers

```
docker ps
```

## Show all containers (running and closed)

```
docker ps -a
```

What a successfully built/run set of docker containers looks like:
![make web screenshot](readme_screenshots/running_docker_ps_-a.png "Running `docker ps -a`")

_Note: The exited container is correct, as that container executes database migrations and then closes_

## View the logs for a container

`docker logs <container id or name>`  
Include `-f` to "follow" the container logs, showing logs in real time

## Prune Docker Artifacts

Over a long period time, Docker can run out of storage memory. When this happens, docker will log a message indicating it is out of memory.

The below command will delete docker artifacts to recover docker hard-drive space.

See [documentation](https://docs.docker.com/engine/reference/commandline/system_prune/) for OPTIONS.

```
docker system prune [OPTIONS]
```

# Troubleshooting

## Make Issues

If you get an error saying the `make` command is not found, you may need to install it first.  
See [Ensure you can run the make command](#ensure-you-can-run-the-make-command)

## Docker Service Issues

### ENV

A docker service can fail if required environment variables can't be found.  
Double check that your `.env` has the latest variables from `env.docker`, which may have been updated.

## Docker Timezone Issue

While trying to run a make command such as `make web`, if you encounter an issue along the lines of:

```
E: Release file for http://deb.debian.org/debian/dists/buster-updates/InRelease is not valid yet (invalid for another 1d 1h 5min 13s). Updates for this repository will not be applied.
```

it may be possible that your system clock is out of date or not synced (dockerfile timezone has to match your machine timezone).
In this case, make sure your timezone is correct and matches that of docker and restart your machine/terminal window and try again.

## Database Container Wont Start

If you already had PSQL installed, it is likely that the default port `5432` is already in use and the instance running in Docker fails because it can't acquire that port.

- You can either stop the existing PSQL service, freeing up the port for Dockers use.
- Or alter the `DB_PORT` environment variable in `.env` to something not in use (ex: `5433`).
  - You will likely need to run `make clean` and `make web` to ensure the containers are re-built with the new variables.

# Helpful Tools

## DBeaver

GUI-centric application for viewing/interacting with Databases.

- https://dbeaver.io/

### Pre-req

- Intall PostgreSQL 12+
- https://www.postgresql.org/download/

### Add a new connection

- Click New Database Connection (+ icon)
  - Host: localhost
  - Port: 5432
  - Database: biohubbc
  - username: postgres
  - password: postgres
  - user role: (leave empty)
  - local client: PostgreSQL 12

_Note: all of the above connection values can be found in the `.env` file_

# Acknowledgements

[![SonarCloud](https://sonarcloud.io/images/project_badges/sonarcloud-black.svg)](https://sonarcloud.io/dashboard?id=bcgov_biohubbc)

# License

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
