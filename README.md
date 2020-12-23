[![img](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bcgov_biohubbc&metric=alert_status)](https://sonarcloud.io/dashboard?id=bcgov_biohubbc)

# BioDiversityHub BC

Sub-project under the SEISM Capital project, the source of BC’s species inventory data.

The objectives for the BioHubBC project are:

- To provide a single source for aquatic and terrestrial species and habitat data.
- To reduce the barriers for collecting and sharing aquatic and terrestrial species and habitat data throughout the province of British Columbia.
- To reduce the effort involved with managing aquatic and terrestrial species and habitat data.
- To improve access for all stakeholders to the aquatic and terrestrial species and habitat data needed to make informed decisions and policies for the province.

# Running Locally with Docker

See `./Makefile` for all available commands.

## Pre-reqs

Initialize the `./env` file.

This file may need additional editing to provide secrets, etc.

```
make env
```

## Run all projects

Runs the database, api, web and ionic frontends.

```
make all
```

## Run only backend projects

Runs the database and api.

```
make backend
```

## Run web projects

Runs the database, api, and web frontend.

```
make web
```

## Run ionic projects

Runs the database, api, and ionic frontend.

```
make ionic
```

## Calling the API

Access the api directly: `localhost:6100/api/`

Access the api via the nginx reverse proxy: `localhost:80/api/`

<br />

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
