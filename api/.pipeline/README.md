# Openshift PR-Based Pipeline via GitHub Actions

## Important files/folders

- ### _./.github/workflows/_

  The workflows executed by the GitHub Actions mechanism

  - #### _./github/workflows/deploy.yml_

    The workflow that runs when a PR is opened.

  - #### _./github/workflows/deployStatic.yml_

    The workflow that runs when a PR is closed/merged.

- ### _./.config/config.json_

  Root config object used in various parts of the pipeline

- ### _./api/.pipeline/_

  Contains all of the jobs executed as part of one or more GitHub workflows

  - #### _./api/.pipeline/package.json_

    Defines the scripts executed in one or more steps (in a GitHub Workflow->job)

  - #### _./api/.pipeline/config.js_

    Defines the scripts executed in one or more steps (in a GitHub Workflow->job)

  - #### _./api/.pipeline/lib/_

    Defines additional config used by the pipeline, extending the root config.

  - #### _./api/.pipeline/utils/_

    Contains general helper functions utilized by the task functions

- ### _./api/openshift/_

  Contains OpenShift yaml configs for builds/deployments/etc. These are utilized by the library functions when configuring pods/commands.

- ### _./Dockerfile_
  Used to build the api image, as part of the execution of the OpenShift build config.

## Important technologies/repos

- ### _pipeline-cli_

  The BCGov npm package that is leveraged heavily in the `./api/.pipeline/*` code.

  Repo: https://github.com/BCDevOps/pipeline-cli

- ### _GitHub Workflows_

  https://docs.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow

- ### _OpenShift_

  https://docs.openshift.com/container-platform/3.11/welcome/index.html

## General flow of pipeline execution

1. GitHub PR is opened/closed/etc  
   _Workflow execution triggers are controlled using `on:` statements_
2. GitHub Workflows are executed
3. Within a given workflow:

   1. Jobs are executed  
      _The conditional execution of jobs can be controlled using `if:` statements_  
      _The execution order of jobs can be controlled using `needs:` statements_

   2. Within a given job:

      1. Steps are executed
      2. Eventually one of the steps will execute one or more npm commands  
         _These npm commands match package.json scripts in `.../.pipeline/package.json`_

      3. Within a given npm command:

         1. The pacakge.json script runs, and executes the `.../.pipeline/` file it references  
            _This file may configure and execute one or more `.../.pipeline/lib/` tasks_
         2. The `../.pipeline/lib` task will utilize the `pipeline-cli` tool and the `../openshift/` configs to configure and run OpenShift pods/commands
