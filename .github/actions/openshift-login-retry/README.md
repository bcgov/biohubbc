# OpenShift Login with Retry

A GitHub Action that provides OpenShift login functionality with retry logic and exponential backoff to handle network timeouts and temporary connectivity issues.

## Features

- **Retry Logic**: Configurable number of retry attempts (default: 3)
- **Exponential Backoff**: Increasing delay between retries (5s, 10s, 20s, 40s, etc.)
- **Comprehensive Logging**: Clear visibility into retry attempts and failures
- **Flexible Configuration**: Optional namespace parameter
- **Error Handling**: Proper exit codes and error messages

## Usage

### Basic Usage

```yaml
- name: Install OpenShift CLI tools
  uses: redhat-actions/openshift-tools-installer@v1
  with:
    oc: "4.16"

- name: Log in to OpenShift
  uses: ./.github/actions/openshift-login-retry
  with:
    openshift_server_url: https://api.silver.devops.gov.bc.ca:6443
    openshift_token: ${{ secrets.TOOLS_SA_TOKEN }}
    namespace: ${{ vars.OPENSHIFT_LICENSE_PLATE }}-dev
```

### Advanced Usage

```yaml
- name: Log in to OpenShift with custom retry settings
  uses: ./.github/actions/openshift-login-retry
  with:
    openshift_server_url: https://api.silver.devops.gov.bc.ca:6443
    openshift_token: ${{ secrets.TOOLS_SA_TOKEN }}
    namespace: ${{ vars.OPENSHIFT_LICENSE_PLATE }}-dev
    max_retries: 15
    base_delay: 3
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `openshift_server_url` | OpenShift server URL | Yes | - |
| `openshift_token` | OpenShift token for authentication | Yes | - |
| `namespace` | OpenShift namespace | No | '' (empty string) |
| `max_retries` | Maximum number of retry attempts | No | '10' |
| `base_delay` | Base delay in seconds for exponential backoff | No | '5' |

## Retry Logic

The action uses exponential backoff with the following delay pattern:
- Attempt 1: Immediate
- Attempt 2: 5 seconds
- Attempt 3: 10 seconds
- Attempt 4: 20 seconds
- Attempt 5: 40 seconds
- And so on...

The maximum delay is calculated as: `base_delay * (2 ^ retry_count)`

## Error Handling

- If login succeeds on any attempt, the action exits successfully
- If all retry attempts fail, the action exits with code 1
- Each retry attempt is logged with clear status messages
- The final failure message indicates the total number of attempts made

## Prerequisites

- OpenShift CLI (`oc`) must be installed and available in the PATH
- Valid OpenShift token with appropriate permissions
- Network access to the OpenShift server
