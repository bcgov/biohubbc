import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { GeoJSONFeature } from '../../../../../../openapi/schemas/geoJson';
import {
  paginationRequestQueryParamSchema,
  paginationResponseSchema
} from '../../../../../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { CreateSampleSiteObject, SampleSiteService } from '../../../../../../services/sample-site-service';
import { getLogger } from '../../../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../../../utils/pagination';

export const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/sample-site/');

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
  getSurveySampleSitesForSurvey()
];

GET.apiDoc = {
  description: 'Get survey sample sites.',
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
    {
      in: 'query',
      name: 'keyword',
      schema: {
        type: 'string',
        description:
          'A keyword to search for in the sample site name or description. If provided, pagination will be ignored.'
      },
      required: false
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
            additionalProperties: false,
            properties: {
              sampleSites: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['survey_sample_site_id', 'survey_id', 'name', 'description', 'geometry_type'],
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
                    geometry_type: {
                      type: 'string',
                      maxLength: 50
                    },
                    blocks: {
                      type: 'array',
                      items: {
                        type: 'object',
                        additionalProperties: false,
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
                          },
                          name: {
                            type: 'string'
                          },
                          description: {
                            type: 'string'
                          }
                        }
                      }
                    },
                    stratums: {
                      type: 'array',
                      items: {
                        type: 'object',
                        additionalProperties: false,
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
                          },
                          name: {
                            type: 'string'
                          },
                          description: {
                            type: 'string'
                          }
                        }
                      }
                    }
                  }
                }
              },
              pagination: { ...paginationResponseSchema }
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
 * Get all survey sample sites, paginated or filtered by keyword.
 *
 * @returns {RequestHandler}
 */
export function getSurveySampleSitesForSurvey(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const surveyId = Number(req.params.surveyId);

      const keyword = req.query.keyword as string | undefined;

      const paginationOptions = makePaginationOptionsFromRequest(req);

      await connection.open();

      const sampleSiteService = new SampleSiteService(connection);
      const sampleSites = await sampleSiteService.getSampleSitesForSurveyId(surveyId, {
        keyword: keyword,
        pagination: ensureCompletePaginationOptions(paginationOptions)
      });

      const sampleSitesTotalCount = await sampleSiteService.getSampleSitesCountBySurveyId(surveyId);

      await connection.commit();

      return res.status(200).json({
        sampleSites,
        pagination: makePaginationResponse(sampleSitesTotalCount, paginationOptions)
      });
    } catch (error) {
      defaultLog.error({ label: 'getSurveySampleSitesForSurvey', message: 'error', error });
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
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
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
  description: 'Insert new survey sample site records.',
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
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['survey_sample_sites', 'blocks', 'site_block_assignments'],
          properties: {
            survey_sample_sites: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  name: {
                    type: 'string',
                    description: 'Name of the sampling site'
                  },
                  description: {
                    type: 'string',
                    description: 'Description of the sampling site',
                    nullable: true
                  },
                  geojson: { ...(GeoJSONFeature as object) },
                  site_assignment_id: { type: 'string', description: 'Temporary id for a site' }
                }
              }
            },
            blocks: {
              type: 'array',
              description: 'Array of blocks to create',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['name', 'description'],
                properties: {
                  name: {
                    type: 'string',
                    description: 'Name of the block'
                  },
                  description: {
                    type: 'string',
                    description: 'Description of the block',
                    nullable: true
                  },
                  geojson: { ...(GeoJSONFeature as object), description: 'Geometry of the block' },
                  block_assignment_id: { type: 'string', description: 'Temporary id for a block' }
                }
              }
            },
            site_block_assignments: {
              type: 'array',
              description: 'Array of site-block assignments, indicating which blocks to assign which sites to.',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['block_assignment_id', 'site_assignment_id'],
                properties: {
                  block_assignment_id: { type: 'string', description: 'Temporary id for a block' },
                  site_assignment_id: { type: 'string', description: 'Temporary id for a site' }
                }
              }
            },
            site_stratum_assignments: {
              type: 'array',
              description: 'Array of site-stratum assignments, indicating which stratums to assign which sites to.',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['stratum_assignment_id', 'site_assignment_id'],
                properties: {
                  stratum_assignment_id: { type: 'string', description: 'Temporary id for a stratum' },
                  site_assignment_id: { type: 'string', description: 'Temporary id for a site' }
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
    const connection = getDBConnection(req.keycloak_token);

    try {
      const sampleSite: CreateSampleSiteObject = {
        ...req.body,
        survey_id: Number(req.params.surveyId)
      };

      await connection.open();

      const sampleSiteService = new SampleSiteService(connection);

      await sampleSiteService.createSampleSitesAndBlocks(sampleSite);

      await connection.commit();

      return res.status(201).send();
    } catch (error) {
      defaultLog.error({ label: 'createSurveySampleSiteRecord', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
