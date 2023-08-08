/**
 * Request Object for project create POST request
 */
export const projectCreatePostRequestObject = {
  title: 'Project post request object',
  type: 'object',
  required: ['coordinator', 'project', 'location', 'iucn'],
  properties: {
    coordinator: {
      title: 'Project coordinator',
      type: 'object',
      required: ['first_name', 'last_name', 'email_address', 'coordinator_agency', 'share_contact_details'],
      properties: {
        first_name: {
          type: 'string'
        },
        last_name: {
          type: 'string'
        },
        email_address: {
          type: 'string'
        },
        coordinator_agency: {
          type: 'string'
        },
        share_contact_details: {
          type: 'string',
          enum: ['true', 'false']
        }
      }
    },
    project: {
      title: 'Project details',
      type: 'object',
      properties: {
        project_name: {
          type: 'string'
        },
        project_programs: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'number'
          }
        },
        project_types: {
          type: 'array',
          items: {
            type: 'number'
          }
        },
        start_date: {
          type: 'string',
          description: 'ISO 8601 date string'
        },
        end_date: {
          type: 'string',
          description: 'ISO 8601 date string'
        }
      }
    },
    location: {
      title: 'Location',
      type: 'object',
      properties: {
        location_description: {
          type: 'string',
          description: 'Location description'
        }
      }
    },
    iucn: {
      title: 'Project IUCN classifications',
      type: 'object',
      properties: {
        classificationDetails: {
          type: 'array',
          items: {
            title: 'IUCN classification',
            type: 'object',
            properties: {
              classification: {
                type: 'number'
              },
              subClassification1: {
                type: 'number'
              },
              subClassification2: {
                type: 'number'
              }
            }
          }
        }
      }
    },
    partnerships: {
      title: 'Project partnerships',
      type: 'object',
      properties: {
        indigenous_partnerships: {
          type: 'array',
          items: {
            type: 'number'
          }
        },
        stakeholder_partnerships: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    }
  }
};

const projectUpdateProperties = {
  coordinator: {
    type: 'object',
    properties: {
      first_name: { type: 'string' },
      last_name: { type: 'string' },
      email_address: { type: 'string' },
      coordinator_agency: { type: 'string' },
      share_contact_details: { type: 'string' },
      revision_count: { type: 'number' }
    }
  },
  project: { type: 'object', properties: {} },
  objectives: { type: 'object', properties: {} },
  location: { type: 'object', properties: {} },
  iucn: {
    type: 'object',
    properties: {
      classificationDetails: {
        type: 'array',
        items: {
          title: 'IUCN classification',
          type: 'object',
          properties: {
            classification: {
              type: 'number'
            },
            subClassification1: {
              type: 'number'
            },
            subClassification2: {
              type: 'number'
            }
          }
        }
      }
    }
  },
  partnerships: { type: 'object', properties: {} }
};

/**
 * Response object for project update GET request
 */
export const projectUpdateGetResponseObject = {
  title: 'Project get response object, for update purposes',
  type: 'object',
  properties: {
    ...projectUpdateProperties
  }
};

/**
 * Request object for project update PUT request
 */
export const projectUpdatePutRequestObject = {
  title: 'Project Put Object',
  type: 'object',
  properties: {
    ...projectUpdateProperties
  }
};
