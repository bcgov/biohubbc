import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { Feature } from 'geojson';
import { getDBConnection } from '../../database/db';
import { GeoJSONFeature } from '../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { BcgwLayerService, RegionDetails } from '../../services/bcgw-layer-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/spatial/regions');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getRegions()
];

POST.apiDoc = {
  description: 'Fetch a list of NRM and ENV region names that intersect the provided geometry.',
  tags: ['spatial', 'regions'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          properties: {
            features: {
              description: 'One or more GeoJSON features',
              type: 'array',
              items: GeoJSONFeature
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: '200 Ok',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['regions'],
            properties: {
              regions: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['regionName', 'sourceLayer'],
                  properties: {
                    regionName: {
                      type: 'string'
                    },
                    sourceLayer: {
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
 * Given an array of GeoJSON Features, returns an array of region details.
 *
 * Notes:
 * - If a feature can be determined as having come from a known/supported BCGW layer, the region information from
 * the feature will be added directly to the response.
 * - If a feature can be determined as having come from a known/supported BCGW layer, then the geometry portion of the
 * feature will be converted to Well-Known Text (WKT), and queried against the BCGW WFS service, returning matching
 * region information, which will then be added to the response.
 * - The response should not include duplicate information.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getRegions(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const features = req.body.features as Feature[];

      let regionsDetails: RegionDetails[] = [];

      const bcgwLayerService = new BcgwLayerService();

      await connection.open();

      regionsDetails = await bcgwLayerService.getUniqueRegionsForFeatures(features, connection);

      await connection.commit();

      return res.status(200).json({
        regions: regionsDetails
      });
    } catch (error) {
      defaultLog.error({ label: 'getRegions', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
