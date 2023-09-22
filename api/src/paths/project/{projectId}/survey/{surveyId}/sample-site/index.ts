import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { GeoJSONFeature, GeoJSONFeatureCollection } from '../../../../../../openapi/schemas/geoJson';
import { PostSampleLocations } from '../../../../../../repositories/sample-location-repository';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { SampleLocationService } from '../../../../../../services/sample-location-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/sample-site/');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
          projectId: Number(req.params.projectId),
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
    }
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
                  properties: {
                    survey_sample_site_id: {
                      type: 'number'
                    },
                    survey_id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    },
                    description: {
                      type: 'string'
                    },
                    geojson: {
                      ...(GeoJSONFeature as object)
                    },
                    geography: {
                      type: 'string'
                    },
                    create_date: {
                      type: 'string'
                    },
                    create_user: {
                      type: 'number'
                    },
                    update_date: {
                      type: 'string',
                      nullable: true
                    },
                    update_user: {
                      type: 'number',
                      nullable: true
                    },
                    revision_count: {
                      type: 'number'
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
      const surveyId = Number(req.params.surveyId);

      await connection.open();

      const sampleLocationService = new SampleLocationService(connection);

      const result = await sampleLocationService.getSampleLocationsForSurveyId(surveyId);

      await connection.commit();

      return res.status(200).json({ sampleSites: result });
    } catch (error) {
      defaultLog.error({ label: 'getSurveySampleLocationRecords', message: 'error', error });
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
          projectId: Number(req.params.projectId),
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
          properties: {
            sampleSite: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                },
                description: {
                  type: 'string'
                },
                survey_sample_sites: {
                  ...(GeoJSONFeatureCollection as object)
                }
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Sample site added OK.'
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

export function createSurveySampleSiteRecord(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.body.sampleSite) {
      throw new HTTP400('Missing required body param `sampleSite`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const sampleSite: PostSampleLocations = req.body.sampleSite;

      sampleSite.survey_id = Number(req.params.surveyId);

      await connection.open();

      const sampleLocationService = new SampleLocationService(connection);

      await sampleLocationService.insertSampleLocations(sampleSite);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'insertProjectParticipants', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
