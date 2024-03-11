import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { GeoJSONFeature } from '../../../../../../openapi/schemas/geoJson';
import {
  paginationRequestQueryParamSchema,
  paginationResponseSchema
} from '../../../../../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { PostSampleLocations, SampleLocationService } from '../../../../../../services/sample-location-service';
import { getLogger } from '../../../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../../../utils/pagination';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/sample-site/');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveySampleLocationRecords()
];

GET.apiDoc = {
  description: 'Get all survey sample sites.',
  tags: ['survey'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'List of survey sample sites.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              sampleSites: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['survey_sample_site_id', 'survey_id', 'name', 'description', 'geojson'],
                  properties: {
                    survey_sample_site_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    survey_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    name: {
                      type: 'string',
                      maxLength: 50
                    },
                    description: {
                      type: 'string',
                      maxLength: 250
                    },
                    geojson: {
                      ...(GeoJSONFeature as object)
                    },
                    sample_methods: {
                      type: 'array',
                      required: [
                        'survey_sample_method_id',
                        'survey_sample_site_id',
                        'method_lookup_id',
                        'method_response_metric_id',
                        'sample_periods'
                      ],
                      items: {
                        type: 'object',
                        properties: {
                          survey_sample_method_id: {
                            type: 'integer',
                            minimum: 1
                          },
                          survey_sample_site_id: {
                            type: 'integer',
                            minimum: 1
                          },
                          method_lookup_id: {
                            type: 'integer',
                            minimum: 1
                          },
                          description: {
                            type: 'string',
                            maxLength: 250
                          },
                          sample_periods: {
                            type: 'array',
                            required: [
                              'survey_sample_period_id',
                              'survey_sample_method_id',
                              'start_date',
                              'start_time',
                              'end_date',
                              'end_time'
                            ],
                            items: {
                              type: 'object',
                              properties: {
                                survey_sample_period_id: {
                                  type: 'integer',
                                  minimum: 1
                                },
                                survey_sample_method_id: {
                                  type: 'integer',
                                  minimum: 1
                                },
                                start_date: {
                                  type: 'string'
                                },
                                start_time: {
                                  type: 'string',
                                  nullable: true
                                },
                                end_date: {
                                  type: 'string'
                                },
                                end_time: {
                                  type: 'string',
                                  nullable: true
                                }
                              },
                              additionalProperties: false
                            }
                          },
                          method_response_metric_id: { type: 'number', minimum: 1 }
                        },
                        additionalProperties: false
                      }
                    },
                    sample_blocks: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['survey_sample_block_id', 'survey_sample_site_id', 'survey_block_id'],
                        properties: {
                          survey_sample_block_id: {
                            type: 'number'
                          },
                          survey_sample_site_id: {
                            type: 'number'
                          },
                          survey_block_id: {
                            type: 'number'
                          }
                        }
                      }
                    },
                    sample_stratums: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['survey_sample_stratum_id', 'survey_sample_site_id', 'survey_stratum_id'],
                        properties: {
                          survey_sample_stratum_id: {
                            type: 'number'
                          },
                          survey_sample_site_id: {
                            type: 'number'
                          },
                          survey_stratum_id: {
                            type: 'number'
                          }
                        }
                      }
                    }
                  },
                  additionalProperties: false
                }
              },
              pagination: { ...paginationResponseSchema }
            },
            additionalProperties: false
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
 * Get all survey sample sites.
 *
 * @returns {RequestHandler}
 */
export function getSurveySampleLocationRecords(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);
      const paginationOptions = makePaginationOptionsFromRequest(req);

      const sampleLocationService = new SampleLocationService(connection);
      const sampleSites = await sampleLocationService.getSampleLocationsForSurveyId(
        surveyId,
        ensureCompletePaginationOptions(paginationOptions)
      );

      const sampleSitesTotalCount = await sampleLocationService.getSampleLocationsCountBySurveyId(surveyId);

      await connection.commit();

      return res.status(200).json({
        sampleSites,
        pagination: makePaginationResponse(sampleSitesTotalCount, paginationOptions)
      });
    } catch (error) {
      defaultLog.error({ label: 'getSurveySampleLocationRecords', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  createSurveySampleSiteRecord()
];

POST.apiDoc = {
  description: 'Insert new survey sample site record.',
  tags: ['project', 'survey'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['methods', 'survey_sample_sites'],
          properties: {
            methods: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['method_lookup_id', 'description', 'periods', 'method_response_metric_id'],
                properties: {
                  method_lookup_id: {
                    type: 'integer'
                  },
                  description: {
                    type: 'string'
                  },
                  periods: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['start_date', 'end_date'],
                      properties: {
                        start_date: {
                          type: 'string'
                        },
                        end_date: {
                          type: 'string'
                        },
                        start_time: {
                          type: 'string',
                          nullable: true
                        },
                        end_time: {
                          type: 'string',
                          nullable: true
                        }
                      }
                    }
                  },
                  method_response_metric_id: {
                    type: 'number',
                    minimum: 1
                  }
                }
              }
            },
            survey_sample_sites: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  description: {
                    type: 'string'
                  },
                  geojson: { ...(GeoJSONFeature as object) }
                }
              }
            }
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Sample site added OK.'
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

export function createSurveySampleSiteRecord(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const sampleSite: PostSampleLocations = {
        ...req.body,
        survey_id: Number(req.params.surveyId)
      };

      await connection.open();

      const sampleLocationService = new SampleLocationService(connection);

      await sampleLocationService.insertSampleLocations(sampleSite);

      await connection.commit();

      return res.status(201).send();
    } catch (error) {
      defaultLog.error({ label: 'insertProjectParticipants', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
