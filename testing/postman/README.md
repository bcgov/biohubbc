# Postman

Postman is a tool used to build and execute HTTP requests against an existing API, for development and testing purposes.

# Setup

## 1. Get the Postman App

https://www.postman.com/downloads/

## 2. Import the API Collection and Environment files for SIMS and BIoHub.

- Download the API Collection file and Environment Variables files from `https://nrs.objectstore.gov.bc.ca/gblhvt/postman/`
- In Postman, on the `Collections` tab
- Click the `Import` button
- Select and import both the API Collection file and the Environment Variables file.

## 3. Update the environment variables

The environment file does not include any sensitive values by default (passwords).
Navigate to the Environment section in Postman and update the Current Value column for each of the secret password fields.

_Note: Variables that start with an underscore can be ignored, as they will be generated automatically at runtime._

## Select environment

- In the top right corner of the Postman app is a dropdown where the active environment can be selected.
- You can also enable an environment via the Environments tab in the left side menu.

# Calling Authenticated Endpoints

There are 2 kinds of authentication that are supported by this Postman collection.

## 1. Authenticating as a user (ie: idir, bceid)

- Click on the top level folder for the API you wish to use (ex: `SIMS API`).
- On the `Authorization` tab, scroll to the bottom, and click the `Get New Access Token` button.
- Follow the prompts to log in
- When the token is generated, click the `Use Token` button to activate the generated token (applying it to this folder and all of its children)

  _Note: This will need to be done separately for both the `SIMS API` and `BioHub API` folders as they use different Keycloak clients when generating their tokens._

## 2. Authenticating as a service client (ie: sims, biohub)

- Simply execute a request, and a token will automatically be generated and applied at runtime.

  _Note: The process for generating a service client token is simpler that a user token, because unlike the user authentication, we can directly login using a service client's username and password._

# Updating the Postman API Collection file and/or Environment Variables file

- Update the collection in the Postman app, and export the API Collection file and/or Environment Variables file.
  - Note: Environment variables marked secret should automatically be scrubbed from the exported environment variables file, but it
  - is always best to double check just in case.
- Upload the files to S3 under `./postman`
