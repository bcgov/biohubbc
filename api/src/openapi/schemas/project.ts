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
  project: { type: 'object', additionalProperties: false, properties: {} },
  objectives: { type: 'object', additionalProperties: false, properties: {} },
  iucn: {
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
  participants: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {} } }
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
