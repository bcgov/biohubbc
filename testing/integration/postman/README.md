# API Testing with Postman (POC)

This is the Postman Setup for testing the API. It's primary goal is to run against our PR and Dev code.

## How to run the PostMan Tests:


### Import files
- [Get Postman](https://www.postman.com/downloads/)
- File > Import Folder
- Select the `./testing/integration/postman` folder.

### Select environment
- In the drop-down at the top-right corner of the screen, select `BioHubBC-API-DEV`

### Edit the environment
- Next to the drop-down, click the 3 dots menu.
- From the pop-up window, click the `BioHubBC-API-DEV` environment
- Edit the `Current Value` column for the following fields with placeholder values:
  - BASEURL
  - TEST_USERNAME
  - TEST_PASSWORD

  ```json
  ({
    "key": "BASEURL",
    "value": "Change to APU url",
    "enabled": true
  },
  {
    "key": "TEST_USERNAME",
    "value": "<<Change to test user username>>",
    "enabled": true
  },
  {
    "key": "TEST_PASSWORD",
    "value": "<<Change to test user password>>",
    "enabled": true
  })
  ```

## Running Tests

- Tests can be run within the Postman application either one by one or with the _Runner_ option, which allows for the complete suite to run.
- Tests can also run from the command line (and therefore the CI) with [Newman](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)

## License

    Copyright 2020 Province of British Columbia

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
