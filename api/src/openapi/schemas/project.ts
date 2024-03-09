import { PROJECT_ROLE } from '../../constants/roles';

/**
 * Request Object for project create POST request
 */
export const projectCreatePostRequestObject = {
  title: 'Project post request object',
  type: 'object',
  additionalProperties: false,
  required: ['project', 'iucn', 'participants'],
  properties: {
    project: {
      title: 'Project details',
      type: 'object',
      additionalProperties: false,
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
        start_date: {
          type: 'string',
          description: 'ISO 8601 date string'
        },
        end_date: {
          type: 'string',
          description: 'ISO 8601 date string',
          nullable: true
        }
      }
    },
    iucn: {
      title: 'Project IUCN classifications',
      type: 'object',
      additionalProperties: false,
      properties: {
        classificationDetails: {
          type: 'array',
          items: {
            title: 'IUCN classification',
            type: 'object',
            additionalProperties: false,
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
    participants: {
      title: 'Project participants',
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['system_user_id', 'project_role_names'],
        properties: {
          system_user_id: {
            type: 'number'
          },
          project_role_names: {
            type: 'array',
            items: {
              type: 'string',
              enum: [PROJECT_ROLE.COORDINATOR, PROJECT_ROLE.COLLABORATOR, PROJECT_ROLE.OBSERVER]
            }
          }
        }
      }
    }
  }
};

const projectUpdateProperties = {
  project: {
    description: 'Basic project metadata',
    type: 'object',
    additionalProperties: false,
    required: ['project_name', 'project_programs', 'start_date', 'end_date', 'revision_count'],
    nullable: true,
    properties: {
      project_id: {
        type: 'integer',
        minimum: 1
      },
      uuid: {
        type: 'string'
      },
      comments: {
        type: 'string',
        nullable: true
      },
      project_name: {
        type: 'string'
      },
      project_programs: {
        type: 'array',
        items: {
          type: 'number'
        }
      },
      start_date: {
        type: 'string',
        format: 'date',
        description: 'ISO 8601 date string for the project start date'
      },
      end_date: {
        type: 'string',
        format: 'date',
        description: 'ISO 8601 date string for the project end date',
        nullable: true
      },
      revision_count: {
        type: 'number'
      }
    }
  },
  objectives: {
    description: 'The project objectives',
    type: 'object',
    additionalProperties: false,
    required: ['objectives'],
    nullable: true,
    properties: {
      objectives: {
        type: 'string'
      },
      revision_count: {
        type: 'number'
      }
    }
  },
  iucn: {
    description: 'The International Union for Conservation of Nature number',
    type: 'object',
    additionalProperties: false,
    required: ['classificationDetails'],
    nullable: true,
    properties: {
      classificationDetails: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
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
  participants: {
    title: 'Project participants',
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: false,
      required: ['system_user_id', 'display_name', 'email', 'agency', 'identity_source', 'project_role_names'],
      properties: {
        project_participation_id: {
          type: 'number'
        },
        project_id: {
          type: 'number'
        },
        system_user_id: {
          type: 'number'
        },
        project_role_ids: {
          type: 'array',
          items: {
            type: 'number'
          }
        },
        project_role_names: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        project_role_permissions: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        user_identifier: {
          description: 'The unique user identifier',
          type: 'string'
        },
        user_guid: {
          type: 'string',
          description: 'The GUID for the user.',
          nullable: true
        },
        identity_source: {
          description: 'The source of the user identity',
          type: 'string'
        },
        record_end_date: {
          oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
          description: 'Determines if the user record has expired',
          nullable: true
        },
        role_ids: {
          description: 'list of role ids for the user',
          type: 'array',
          items: {
            type: 'integer',
            minimum: 1
          }
        },
        role_names: {
          description: 'list of role names for the user',
          type: 'array',
          items: {
            type: 'string'
          }
        },
        email: {
          type: 'string'
        },
        display_name: {
          type: 'string'
        },
        given_name: {
          type: 'string',
          nullable: true
        },
        family_name: {
          type: 'string',
          nullable: true
        },
        agency: {
          type: 'string',
          nullable: true
        }
      }
    }
  }
};

/**
 * Response object for project update GET request
 */
export const projectUpdateGetResponseObject = {
  title: 'Project get response object, for update purposes',
  type: 'object',
  additionalProperties: false,
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
  additionalProperties: false,
  properties: {
    ...projectUpdateProperties
  }
};
