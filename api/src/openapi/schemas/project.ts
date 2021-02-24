/**
 * Project endpoint post body openapi schema.
 *
 * TODO WIP - this object is not in any kind of final form and can change as needed.
 */
export const projectPostBody = {
  title: 'Project Post Object',
  type: 'object',
  required: ['project'],
  properties: {
    project: {
      title: 'Project Model Object',
      type: 'object',
      // required: [],
      properties: {
        name: {
          type: 'string'
        },
        objectives: {
          type: 'string'
        },
        scientific_collection_permit_number: {
          type: 'string'
        },
        management_recovery_action: {
          type: 'string'
        },
        location_description: {
          type: 'string'
        },
        start_date: {
          type: 'string'
        },
        end_date: {
          type: 'string'
        },
        results: {
          type: 'string'
        },
        caveats: {
          type: 'string'
        },
        comments: {
          type: 'string'
        },
        coordinator_first_name: {
          type: 'string'
        },
        coordinator_last_name: {
          type: 'string'
        },
        coordinator_email_address: {
          type: 'string'
        },
        coordinator_agency_name: {
          type: 'string'
        }
      }
    },
    species: {
      title: 'Primary and Secondary Species of Interest',
      type: 'object',
      properties: {
        focal_species: {
          type: 'array',
          description: 'Array of focal species',
          items: {
            type: 'string',
            description: 'Species Name'
          }
        },
        ancillary_species: {
          type: 'array',
          description: 'Array of ancillary species',
          items: {
            type: 'string',
            description: 'Species Name'
          }
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
        },
        regions: {
          type: 'array',
          description: 'Array of regions',
          items: {
            type: 'string',
            description: 'Region name'
          }
        }
      }
    },
    funding: {
      title: 'Funding Model Object',
      type: 'object',
      properties: {}
    }
  }
};

/**
 * Project endpoint response body openapi schema.
 */
export const projectResponseBody = {
  title: 'Project Response Object',
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'number'
    }
  }
};
