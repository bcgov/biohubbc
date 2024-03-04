import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { OpenAPIV3 } from 'openapi-types';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { GeoJSONFeatureCollection } from '../../../../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { BctwService } from '../../../../../../../services/bctw-service';
import { ICritterbaseUser } from '../../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../../services/survey-critter-service';
import { getLogger } from '../../../../../../../utils/logger';
const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/critters/{critterId}/telemetry');

const GeoJSONFeatureCollectionFeaturesItems = (GeoJSONFeatureCollection.properties
  ?.features as OpenAPIV3.ArraySchemaObject)?.items as OpenAPIV3.SchemaObject;

const GeoJSONTelemetryPointsAPISchema: OpenAPIV3.SchemaObject = {
  ...GeoJSONFeatureCollection,
  properties: {
    ...GeoJSONFeatureCollection.properties,
    features: {
      type: 'array',
      items: {
        ...GeoJSONFeatureCollectionFeaturesItems,
        properties: {
          ...GeoJSONFeatureCollectionFeaturesItems?.properties,
          properties: {
            type: 'object',
            required: ['collar_id', 'device_id', 'date_recorded', 'deployment_id', 'critter_id'],
            properties: {
              collar_id: {
                type: 'string',
                format: 'uuid'
              },
              device_id: {
                type: 'integer'
              },
              elevation: {
                type: 'number',
                nullable: true
              },
              frequency: {
                type: 'number',
                nullable: true
              },
              critter_id: {
                type: 'string',
                format: 'uuid'
              },
              date_recorded: {
                type: 'string'
              },
              deployment_id: {
                type: 'string',
                format: 'uuid'
              },
              device_status: {
                type: 'string',
                nullable: true
              },
              device_vendor: {
                type: 'string',
                nullable: true
              },
              frequency_unit: {
                type: 'string',
                nullable: true
              },
              wlh_id: {
                type: 'string',
                nullable: true
              },
              animal_id: {
                type: 'string',
                nullable: true
              },
              sex: {
                type: 'string'
              },
              taxon: {
                type: 'string'
              },
              collection_units: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    collection_unit_id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    unit_name: {
                      type: 'string'
                    },
                    collection_category_id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    category_name: {
                      type: 'string'
                    }
                  }
                }
              },
              mortality_timestamp: {
                type: 'string',
                nullable: true
              },
              _merged: {
                type: 'boolean'
              },
              map_colour: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  }
};

const GeoJSONTelemetryTracksAPISchema: OpenAPIV3.SchemaObject = {
  ...GeoJSONFeatureCollection,
  properties: {
    ...GeoJSONFeatureCollection.properties,
    features: {
      type: 'array',
      items: {
        ...GeoJSONFeatureCollectionFeaturesItems,
        properties: {
          ...GeoJSONFeatureCollectionFeaturesItems?.properties,
          properties: {
            type: 'object',
            required: ['critter_id', 'deployment_id'],
            properties: {
              critter_id: {
                type: 'string',
                format: 'uuid'
              },
              deployment_id: {
                type: 'string',
                format: 'uuid'
              },
              map_colour: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  }
};

export const GET: Operation = [
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
  getCritterTelemetry()
];

GET.apiDoc = {
  description: 'Get telemetry points for a specific critter.',
  tags: ['bctw'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer'
      },
      required: true
    },
    {
      in: 'path',
      name: 'critterId',
      schema: {
        type: 'integer'
      },
      required: true
    },
    {
      in: 'query',
      name: 'startDate',
      required: true,
      schema: {
        type: 'string'
      }
    },
    {
      in: 'query',
      name: 'endDate',
      required: true,
      schema: {
        type: 'string'
      }
    }
  ],
  responses: {
    200: {
      description: 'Responds with count of rows created in SIMS DB Deployments.',
      content: {
        'application/json': {
          schema: {
            title: 'Telemetry response',
            type: 'object',
            required: ['tracks', 'points'],
            properties: {
              points: GeoJSONTelemetryPointsAPISchema,
              tracks: GeoJSONTelemetryTracksAPISchema
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

export function getCritterTelemetry(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };

    const critterId = Number(req.params.critterId);
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req['keycloak_token']);
    const surveyCritterService = new SurveyCritterService(connection);
    const bctwService = new BctwService(user);

    try {
      await connection.open();
      const surveyCritters = await surveyCritterService.getCrittersInSurvey(surveyId);

      const critter = surveyCritters.find((surveyCritter) => surveyCritter.critter_id === critterId);
      if (!critter) {
        throw new HTTP400('Specified critter was not part of this survey.');
      }

      const startDate = new Date(String(req.query.startDate));
      const endDate = new Date(String(req.query.endDate));

      const points = await bctwService.getCritterTelemetryPoints(
        critter.critterbase_critter_id,
        startDate,
        endDate
      );

      const tracks = await bctwService.getCritterTelemetryTracks(
        critter.critterbase_critter_id,
        startDate,
        endDate
      );

      await connection.commit();

      return res.status(200).json({ points, tracks });
    } catch (error) {
      defaultLog.error({ label: 'telemetry', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
