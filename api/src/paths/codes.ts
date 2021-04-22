import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { READ_ROLES } from '../constants/roles';
import { getAPIUserDBConnection } from '../database/db';
import { HTTP500 } from '../errors/CustomError';
import { getAllCodeSets } from '../utils/code-utils';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/code');

export const GET: Operation = [logRequest('paths/code', 'GET'), getAllCodes()];

GET.apiDoc = {
  description: 'Get all Codes.',
  tags: ['code'],
  security: [
    {
      Bearer: READ_ROLES
    }
  ],
  responses: {
    200: {
      description: 'Code response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              management_action_type: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              climate_change_initiative: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              first_nations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              funding_source: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              investment_action_category: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    fs_id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              project_activity: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              project_type: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              region: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              species: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              iucn_conservation_action_level_1_classification: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              iucn_conservation_action_level_2_subclassification: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    iucn1_id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              iucn_conservation_action_level_3_subclassification: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    iucn2_id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get all codes.
 *
 * @returns {RequestHandler}
 */
function getAllCodes(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const allCodeSets = await getAllCodeSets(connection);

      if (!allCodeSets) {
        throw new HTTP500('Failed to fetch codes');
      }

      return res.status(200).json(allCodeSets);
    } catch (error) {
      defaultLog.debug({ label: 'getAllCodes', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
