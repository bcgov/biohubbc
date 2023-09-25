import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../database/db';
import { HTTP500 } from '../errors/http-error';
import { CodeService } from '../services/code-service';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths/code');

export const GET: Operation = [getAllCodes()];

GET.apiDoc = {
  description: 'Get all Codes.',
  tags: ['code'],
  responses: {
    200: {
      description: 'Code response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: [
              'management_action_type',
              'first_nations',
              'agency',
              'investment_action_category',
              'type',
              'iucn_conservation_action_level_1_classification',
              'iucn_conservation_action_level_2_subclassification',
              'iucn_conservation_action_level_3_subclassification',
              'program',
              'proprietor_type',
              'system_roles',
              'project_roles',
              'administrative_activity_status_type',
              'field_methods',
              'ecological_seasons',
              'intended_outcomes',
              'vantage_codes',
              'site_selection_strategies'
            ],
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
              agency: {
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
                    agency_id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              type: {
                type: 'array',
                description: 'Types of surveys',
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
              project_program: {
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
              proprietor_type: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    },
                    is_first_nation: {
                      type: 'boolean'
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
              },
              system_role: {
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
              project_role: {
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
              survey_jobs: {
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
              administrative_activity_status_type: {
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
              field_methods: {
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
              ecological_seasons: {
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
              intended_outcomes: {
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
              vantage_codes: {
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
              site_selection_strategies: {
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
              sample_methods_lookup: {
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
export function getAllCodes(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      const codeService = new CodeService(connection);

      const allCodeSets = await codeService.getAllCodeSets();

      await connection.commit();

      if (!allCodeSets) {
        throw new HTTP500('Failed to fetch codes');
      }

      return res.status(200).json(allCodeSets);
    } catch (error) {
      defaultLog.error({ label: 'getAllCodes', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
