# Overview

## Links to jira tickets

- {Include links to all of the applicable Jira tickets}

## This PR contains the following changes

- {List all the relevant changes. If there are many changes across many Jira tickets, organize the changes by Jira ticket}

## This PR contains the following types of changes

- [ ] New feature (change which adds functionality)
- [ ] Enhancement (improvements to existing functionality)
- [ ] Bug fix (change which fixes an issue)
- [ ] Misc cleanup / Refactoring / Documentation
- [ ] Version change

## Checklist

A list of items that are good to consider when making any changes.

_Note: this list is not exhaustive, and not all items are always applicable._

### General

- [ ] I have performed a self-review of my own code

### Code

- [ ] New files/classes/functions have appropriately descriptive names and comment blocks to describe their use/behaviour
- [ ] I have avoided duplicating code when possible, moving re-usable pieces into functions
- [ ] I have avoided hard-coding values where possible and moved any re-usable constants to a constants file
- [ ] My code is as flat as possible (avoids deeply nested if/else blocks, promise chains, etc)
- [ ] My code changes account for null/undefined values and handle errors appropriately
- [ ] My code uses types/interfaces to help describe values/parameters/etc, help ensure type safety, and improve readability

### Style

- [ ] My code follows the established style conventions
- [ ] My code uses native material-ui components/icons/conventions when possible

### Documentation

- [ ] I have commented my code sufficiently, such that an unfamiliar developer could understand my code
- [ ] I have added/updated README's and related documentation, as needed

### Tests

- [ ] I have added/updated unit tests for any code I've added/updated
- [ ] I have added/updated the Postman requests/tests to account for any API endpoints I've added/updated

### Linting/Formatting

- [ ] I have run the linter and fixed any issues, as needed  
       _See the `lint` commands in package.json_
- [ ] I have run the formatter and fixed any issues, as needed  
       _See the `format` commands in package.json_

### SonarCloud

- [ ] I have addressed all SonarCloud Bugs, Vulnerabilities, Security Hotspots, and Code Smells

## How Has This Been Tested?

Please describe the tests that you ran to verify your changes.

## Screenshots

Please add any relevant UI screenshots, if applicable.
