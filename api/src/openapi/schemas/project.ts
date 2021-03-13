/**
 * Project endpoint post body openapi schema.
 *
 * TODO WIP - this object is not in any kind of final form and can change as needed.
 */
export const projectPostBody = {
  title: 'Project Post Object',
  type: 'object',
  required: ['coordinator', 'permit', 'project', 'location', 'species', 'funding'],
  properties: {
    coordinator: {
      title: 'Project coordinator',
      type: 'object',
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
    permit: {
      title: 'Project permits',
      type: 'object',
      properties: {
        permits: {
          type: 'array',
          items: {
            title: 'Project permit',
            type: 'object',
            properties: {
              permit_number: {
                type: 'string'
              },
              sampling_conducted: {
                type: 'string'
              }
            }
          }
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
        project_type: {
          type: 'string'
        },
        project_activities: {
          type: 'array',
          items: {
            type: 'number'
          }
        },
        climate_change_initiatives: {
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
        },
        regions: {
          type: 'array',
          description: 'Array of region names',
          items: {
            type: 'string',
            description: 'Region name'
          }
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
            description: 'Species ID'
          }
        },
        ancillary_species: {
          type: 'array',
          description: 'Array of ancillary species',
          items: {
            type: 'string',
            description: 'Species ID'
          }
        }
      }
    },
    funding: {
      title: 'Project funding sources',
      type: 'object',
      properties: {
        funding_agencies: {
          type: 'array',
          items: {
            title: 'Project funding agency',
            type: 'object',
            properties: {
              agency_id: {
                type: 'number'
              },
              investment_action_category: {
                type: 'number'
              },
              agency_project_id: {
                type: 'string'
              },
              funding_amount: {
                type: 'number'
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
          }
        },
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
