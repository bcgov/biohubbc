// A funding source object requiring first nations specific data (first_nations_id)
export const projectFundingSourceFirstNations = {
  title: 'Project funding source with First Nations data',
  type: 'object',
  required: ['first_nations_id'],
  properties: {
    first_nations_id: {
      type: 'integer',
      minimum: 1
    },
    agency_id: {
      type: 'integer',
      nullable: true
    },
    investment_action_category: {
      type: 'integer',
      nullable: true
    },
    agency_project_id: {
      type: 'string',
      nullable: true
    },
    funding_amount: {
      type: 'number'
    },
    start_date: {
      type: 'string',
      description: 'ISO 8601 date string',
      nullable: true
    },
    end_date: {
      type: 'string',
      description: 'ISO 8601 date string',
      nullable: true
    }
  }
};

// A funding source object requiring agency specific data (agency_id, funding_amount)
export const projectFundingSourceAgency = {
  title: 'Project funding source with Agency data',
  type: 'object',
  required: ['agency_id', 'investment_action_category', 'start_date', 'end_date', 'funding_amount'],
  properties: {
    agency_id: {
      type: 'integer',
      minimum: 1
    },
    investment_action_category: {
      type: 'number',
      nullable: false
    },
    agency_project_id: {
      type: 'string',
      nullable: true
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
};
/**
 * Request Object for project create POST request
 */
export const projectCreatePostRequestObject = {
  title: 'Project post request object',
  type: 'object',
  required: ['coordinator', 'project', 'location', 'iucn', 'funding'],
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
        project_type: {
          type: 'number'
        },
        project_activities: {
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
    funding: {
      title: 'Project funding sources',
      type: 'object',
      properties: {
        fundingSources: {
          type: 'array',
          items: {
            anyOf: [{ ...projectFundingSourceAgency }, { ...projectFundingSourceFirstNations }]
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
  funding: {
    type: 'object',
    properties: {
      fundingSources: {
        type: 'array',
        items: {
          anyOf: [{ ...projectFundingSourceAgency }, { ...projectFundingSourceFirstNations }]
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
