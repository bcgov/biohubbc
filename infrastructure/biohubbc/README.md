# BioHub BC Umbrella Chart

This is an umbrella Helm chart that deploys all BioHub BC components together in the correct order:

1. **app** - React frontend application
2. **database** - PostgreSQL database with PostGIS
3. **database-setup** - Database initialization and migration job (runs after database)
4. **api** - Node.js API server (runs after database-setup)

## Deployment Order

The chart uses Helm hooks to ensure proper deployment order:

- `database-setup` has a `pre-install` hook with weight `1` to run after the database is deployed
- `api` has a `post-install` hook with weight `1` to run after database-setup completes

## Usage

### Install the umbrella chart

```bash
# For development
helm install biohubbc ./biohubbc -f values-dev.yaml

# For test
helm install biohubbc ./biohubbc -f values-test.yaml

# For production
helm install biohubbc ./biohubbc -f values-prod.yaml

# For PR environment
helm install biohubbc ./biohubbc -f values-pr.yaml
```

### Update dependencies

Before deploying, make sure to update the chart dependencies:

```bash
helm dependency update ./biohubbc
```

### Upgrade existing deployment

```bash
helm upgrade biohubbc ./biohubbc -f values-dev.yaml
```

## Component Configuration

Each component can be enabled/disabled by setting the appropriate flag in the values file:

```yaml
app:
  enabled: true

database:
  enabled: true

database-setup:
  enabled: true

api:
  enabled: true
```

## Values Files

- `values.yaml` - Default values
- `values-dev.yaml` - Development environment
- `values-test.yaml` - Test environment
- `values-prod.yaml` - Production environment
- `values-pr.yaml` - PR environment

## Individual Chart Values

Component-specific values are passed through to the individual charts. Each component section in the values file corresponds to the values for that specific chart.

For example, to configure the database component:

```yaml
database:
  enabled: true
  environment:
    name: dev
    id: deploy
  app:
    nodeEnv: development
  replicas: 1
  resources:
    requests:
      cpu: 50m
      memory: 100Mi
    limits:
      cpu: 600m
      memory: 4Gi
  persistence:
    size: 3Gi
```
