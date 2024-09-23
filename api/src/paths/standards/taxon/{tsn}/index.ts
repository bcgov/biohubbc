import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../../database/db';
import { StandardsService } from '../../../../services/standards-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/projects');

export const GET: Operation = [getSpeciesStandards()];

GET.apiDoc = {
  description: 'Gets lookup values for a tsn to describe what information can be uploaded for a given species.',
  tags: ['standards'],
  parameters: [
    {
      in: 'path',
      name: 'tsn',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  security: [],
  responses: {
    200: {
      description: 'Species data standards response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['tsn', 'scientificName', 'measurements', 'markingBodyLocations'],
            properties: {
              tsn: {
                type: 'integer'
              },
              scientificName: {
                type: 'string'
              },
              measurements: {
                type: 'object',
                additionalProperties: false,
                required: ['qualitative', 'quantitative'],
                properties: {
                  qualitative: {
                    description: 'All qualitative measurement type definitions for the survey.',
                    type: 'array',
                    items: {
                      description: 'A qualitative measurement type definition, with array of valid/accepted options',
                      type: 'object',
                      additionalProperties: false,
                      required: ['itis_tsn', 'taxon_measurement_id', 'measurement_name', 'measurement_desc', 'options'],
                      properties: {
                        itis_tsn: {
                          type: 'integer',
                          nullable: true
                        },
                        taxon_measurement_id: {
                          type: 'string'
                        },
                        measurement_name: {
                          type: 'string'
                        },
                        measurement_desc: {
                          type: 'string',
                          nullable: true
                        },
                        options: {
                          description: 'Valid options for the measurement.',
                          type: 'array',
                          items: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['qualitative_option_id', 'option_label', 'option_value', 'option_desc'],
                            properties: {
                              qualitative_option_id: {
                                type: 'string'
                              },
                              option_label: {
                                type: 'string',
                                nullable: true
                              },
                              option_value: {
                                type: 'number'
                              },
                              option_desc: {
                                type: 'string',
                                nullable: true
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  quantitative: {
                    description: 'All quantitative measurement type definitions for the survey.',
                    type: 'array',
                    items: {
                      description: 'A quantitative measurement type definition, with possible min/max constraint.',
                      type: 'object',
                      additionalProperties: false,
                      required: [
                        'itis_tsn',
                        'taxon_measurement_id',
                        'measurement_name',
                        'measurement_desc',
                        'min_value',
                        'max_value',
                        'unit'
                      ],
                      properties: {
                        itis_tsn: {
                          type: 'integer',
                          nullable: true
                        },
                        taxon_measurement_id: {
                          type: 'string'
                        },
                        measurement_name: {
                          type: 'string'
                        },
                        measurement_desc: {
                          type: 'string',
                          nullable: true
                        },
                        min_value: {
                          type: 'number',
                          nullable: true
                        },
                        max_value: {
                          type: 'number',
                          nullable: true
                        },
                        unit: {
                          type: 'string',
                          nullable: true
                        }
                      }
                    }
                  }
                }
              },
              markingBodyLocations: {
                type: 'array',
                items: {
                  required: ['value', 'key', 'id'],
                  additionalProperties: false,
                  type: 'object',
                  properties: {
                    value: { type: 'string' },
                    key: { type: 'string' },
                    id: { type: 'string' }
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
      $ref: '#/components/responses/403'
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
 * Get species data standards
 *
 * @returns {RequestHandler}
 */
export function getSpeciesStandards(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const tsn = Number(req.params.tsn);

      await connection.open();

      const standardsService = new StandardsService(connection);

      const getSpeciesStandardsResponse = await standardsService.getSpeciesStandards(tsn);

      await connection.commit();

      return res.status(200).json(getSpeciesStandardsResponse);
    } catch (error) {
      defaultLog.error({ label: 'getSpeciesStandards', message: 'error', error });
      connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
