import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { GeoJSONFeature } from '../../../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { SampleLocationService } from '../../../../../../services/sample-location-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/sample-site/spatial');

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
  getSurveySampleSitesGeometry()
];

GET.apiDoc = {
  description: 'Get spatial information for all sample sites in the survey.',
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
        type: 'number',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey sample sites spatial get response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            nullable: true,
            required: ['sampleSites'],
            properties: {
              sampleSites: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['survey_sample_site_id', 'geojson'],
                  properties: {
                    survey_sample_site_id: {
                      type: 'integer'
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
 * Fetch geometry for all sampling sites in the survey
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveySampleSitesGeometry(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'getSurveySampleSitesGeometry', surveyId });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const sampleSiteService = new SampleLocationService(connection);

      const sampleSiteData = await sampleSiteService.getSampleLocationsGeometryBySurveyId(surveyId);

      await connection.commit();

      return res.status(200).json({ sampleSites: sampleSiteData });
    } catch (error) {
      defaultLog.error({ label: 'getSurveySampleSitesGeometry', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
