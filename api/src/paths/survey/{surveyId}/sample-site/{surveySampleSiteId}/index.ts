import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400, HTTP409 } from '../../../../../errors/http-error';
import { GeoJSONFeature } from '../../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../services/observation-services/observation-service';
import { SampleSiteService, UpdateSampleSiteObject } from '../../../../../services/sample-site-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/survey/{surveyId}/sample-site/{surveySampleSiteId}');

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  updateSurveySampleSite()
];

PUT.apiDoc = {
  description: 'update survey sample site',
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
      in: 'path',
      name: 'surveySampleSiteId',
      description: 'The ID of the survey sample site to update.',
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
          required: ['sampleSite'],
          properties: {
            sampleSite: {
              type: 'object',
              additionalProperties: false,
              required: ['name', 'description', 'geojson', 'blocks', 'stratums'],
              properties: {
                name: {
                  type: 'string'
                },
                description: {
                  type: 'string'
                },
                geojson: {
                  ...(GeoJSONFeature as object)
                },
                blocks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['survey_block_id'],
                    properties: {
                      survey_block_id: {
                        type: 'number'
                      }
                    }
                  }
                },
                stratums: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['survey_stratum_id'],
                    properties: {
                      survey_stratum_id: {
                        type: 'number'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  responses: {
    204: {
      description: 'Sample site updated OK.'
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

export function updateSurveySampleSite(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const surveyId = Number(req.params.surveyId);

      const sampleSite: UpdateSampleSiteObject = {
        ...req.body.sampleSite,
        survey_sample_site_id: Number(req.params.surveySampleSiteId)
      };

      await connection.open();

      const sampleSiteService = new SampleSiteService(connection);

      await sampleSiteService.updateSampleSite(surveyId, sampleSite);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'updateSurveySampleSite', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  deleteSurveySampleSiteRecord()
];

DELETE.apiDoc = {
  description: 'Delete a survey sample site.',
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
      in: 'path',
      name: 'surveySampleSiteId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    204: {
      description: 'Delete survey sample site OK'
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
    409: {
      $ref: '#/components/responses/409'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function deleteSurveySampleSiteRecord(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const surveySampleSiteId = Number(req.params.surveySampleSiteId);

    if (!surveySampleSiteId) {
      throw new HTTP400('Missing required param `surveySampleSiteId`');
    }

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);
      const samplingSiteObservationsCount = await observationService.getObservationsCountBySampleSiteIds(surveyId, [
        surveySampleSiteId
      ]);

      if (samplingSiteObservationsCount > 0) {
        throw new HTTP409('Cannot delete a sample site that is associated with an observation');
      }

      const sampleSiteService = new SampleSiteService(connection);

      await sampleSiteService.deleteSampleSiteRecord(surveyId, surveySampleSiteId);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteSurveySampleSiteRecord', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR, SURVEY_ROLE.VIEWER],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveySampleSite()
];

GET.apiDoc = {
  description: 'Get a survey sample site by id.',
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
      in: 'path',
      name: 'surveySampleSiteId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'A survey sample site',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['survey_sample_site_id', 'survey_id', 'name', 'description', 'geojson', 'blocks', 'stratums'],
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
              blocks: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    'survey_sample_block_id',
                    'survey_sample_site_id',
                    'survey_block_id',
                    'name',
                    'description'
                  ],
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
                  required: [
                    'survey_sample_stratum_id',
                    'survey_sample_site_id',
                    'survey_stratum_id',
                    'name',
                    'description'
                  ],
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
 * Get a single survey sample site by Id
 *
 * @returns {RequestHandler}
 */
export function getSurveySampleSite(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);
      const surveySampleSiteId = Number(req.params.surveySampleSiteId);

      const sampleSiteService = new SampleSiteService(connection);
      const sampleSite = await sampleSiteService.getSurveySampleSiteBySiteId(surveyId, surveySampleSiteId);

      await connection.commit();

      return res.status(200).json(sampleSite);
    } catch (error) {
      defaultLog.error({ label: 'getSurveySampleSite', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
