export const rootAPIDoc = {
  openapi: '3.0.0',
  info: {
    version: '0.0.0',
    title: 'biohubbc-api',
    description: 'API for BioHubBC',
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
    }
  },
  servers: [
    {
      url: 'http://localhost:6100/api',
      description: 'local api via docker'
    },
    {
      url: 'http://localhost:80/api',
      description: 'local api via docker via nginx'
    },
    {
      url: 'https://api-dev-biohubbc.apps.silver.devops.gov.bc.ca',
      description: 'deployed api in dev environment'
    },
    {
      url: 'https://api-test-biohubbc.apps.silver.devops.gov.bc.ca',
      description: 'deployed api in test environment'
    },
    {
      url: 'https://api-biohubbc.apps.silver.devops.gov.bc.ca',
      description: 'deployed api in prod environment'
    }
  ],
  tags: [
    {
      name: 'template',
      description:
        'Template information used by the frontends (via RJSF) to automatically generate forms to capture/render semi-structured data',
      externalDocs: {
        url: 'react-jsonschema-form.readthedocs.io'
      }
    }
  ],
  externalDocs: {
    description: 'Visit GitHub to find out more about this API',
    url: 'https://github.com/bcgov/biohubbc.git'
  },
  paths: {},
  components: {
    securitySchemes: {
      Bearer: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          "To access the authenticated api routes, a valid JWT token must be present in the 'Authorization' header. The 'Authorization' header value must be of the form: `Bearer xxxxxx.yyyyyyy.zzzzzz`"
      }
    },
    responses: {
      '400': {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      '401': {
        description: 'Unauthenticated user',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      '403': {
        description: 'Unauthorized user',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      '409': {
        description: 'Conflict',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      '500': {
        description: 'Server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      '503': {
        description: 'Service unavailable',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      default: {
        description: 'Unexpected error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      }
    },
    schemas: {
      Error: {
        description: 'Error response object',
        properties: {
          status: {
            type: 'number'
          },
          message: {
            type: 'string'
          },
          errors: {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'string'
                },
                {
                  type: 'object'
                }
              ]
            }
          }
        }
      }
    }
  }
};
