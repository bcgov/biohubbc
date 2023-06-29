import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { Feature } from 'geojson';
import { z } from 'zod';
import { getDBConnection } from '../../database/db';
import { GeoJSONFeature } from '../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { BcgwEnvRegionsLayer, BcgwLayerService, BcgwNrmRegionsLayer } from '../../services/bcgw-layer-service';
import { Srid3005 } from '../../services/geo-service';
import { PostgisService } from '../../services/postgis-service';
import { getLogger } from '../../utils/logger';
import { GeoJSONFeatureZodSchema } from '../../zod-schema/geoJsonZodSchema';

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
            required: ['regions'],
            properties: {
              regions: {
                type: 'array',
                items: {
                  type: 'object',
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
    try {
      const bcgwLayerService = new BcgwLayerService();

      // Collect a set of all regions, in order to remove duplicates
      const regions = new Set<{ regionName: string; sourceLayer: string }>();

      // Check the incoming geometries are valid GeoJSON features
      const features = z.array(GeoJSONFeatureZodSchema).parse(req.body.features) as Feature[];

      // Array of features that did not come from a known or supported BCGW layer
      const unknownFeatures: Feature[] = [];

      for (const feature of features) {
        const regionDetails = bcgwLayerService.findRegionName(feature);

        if (!regionDetails) {
          // No region details exist, or could be determined, add to unknownFeatures array for further processing
          unknownFeatures.push(feature);
        } else {
          // Feature was a known BCGW feature, add to regions set
          regions.add(regionDetails);
        }
      }

      // Convert the unknown GeoJSON geometries into their Well-Known Text (WKT) string representation in EPSG:3005 (BC Albers)
      let unknownFeatureWktStrings: string[] = [];
      const connection = getDBConnection(req['keycloak_token']);
      try {
        await connection.open();

        const postgisService = new PostgisService(connection);

        for (const unknownFeature of unknownFeatures) {
          const result = await postgisService.getGeoJsonGeometryAsWkt(unknownFeature.geometry, Srid3005);
          unknownFeatureWktStrings.push(result.geometry);
        }

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

      // Fetch ENV regions
      await Promise.all(
        unknownFeatureWktStrings.map(async (unknownFeatureWktString) => {
          const envRegionNames = await bcgwLayerService.getEnvRegionNames(unknownFeatureWktString);

          for (const envRegionName of envRegionNames) {
            regions.add({ regionName: envRegionName, sourceLayer: BcgwEnvRegionsLayer });
          }
        })
      );

      // Fetch NRM regions
      await Promise.all(
        unknownFeatureWktStrings.map(async (unknownFeatureWktString) => {
          const nrmRegionNames = await bcgwLayerService.getNrmRegionNames(unknownFeatureWktString);

          for (const nrmRegionName of nrmRegionNames) {
            regions.add({ regionName: nrmRegionName, sourceLayer: BcgwNrmRegionsLayer });
          }
        })
      );

      // TODO add parks layer and management units layer calls?

      // Convert set of regions back to an array
      const response = { regions: Array.from(regions) };

      console.log('===============================================');
      console.log(response);

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getRegions', message: 'error', error });
      throw error;
    }
  };
}
