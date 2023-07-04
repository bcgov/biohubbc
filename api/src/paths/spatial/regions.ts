import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { Feature } from 'geojson';
import { getDBConnection, IDBConnection } from '../../database/db';
import { GeoJSONFeature } from '../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import {
  BcgwEnvRegionsLayer,
  BcgwLayerService,
  BcgwNrmRegionsLayer,
  BcgwParksAndEcoreservesLayer,
  BcgwWildlifeManagementUnitsLayer,
  RegionDetails
} from '../../services/bcgw-layer-service';
import { Srid3005 } from '../../services/geo-service';
import { PostgisService } from '../../services/postgis-service';
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
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const features = req.body.features as Feature[];

      let regionsDetails: RegionDetails[] = [];

      try {
        await connection.open();

        for (const feature of features) {
          const result = await getRegionsForFeature(feature, connection);
          regionsDetails = regionsDetails.concat(result);
        }

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

      // Convert array to set and back to remove duplicate region information
      const response = { regions: Array.from(new Set(regionsDetails)) };

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getRegions', message: 'error', error });
      throw error;
    }
  };
}

/**
 * For a given GeoJSON Feature, fetch all region details from all supported BCGW layers.
 *
 * @param {Feature} feature
 * @param {IDBConnection} connection
 * @return {*}
 */
export async function getRegionsForFeature(feature: Feature, connection: IDBConnection) {
  // Array of all matching region details for the feature
  let response: RegionDetails[] = [];

  const postgisService = new PostgisService(connection);
  // Convert the feature geometry to WKT format
  const result = await postgisService.getGeoJsonGeometryAsWkt(feature.geometry, Srid3005);
  const geometryWKTString = result.geometry;

  const bcgwLayerService = new BcgwLayerService();
  // Attempt to detect if the feature is a known BCGW feature
  const regionDetails = bcgwLayerService.findRegionDetails(feature);

  if (!regionDetails) {
    // Feature is not a known BCGW feature
    // Fetch region details for the feature from ALL available layers
    response = response.concat(
      await getAllRegionDetailsForWktString(geometryWKTString, [
        BcgwEnvRegionsLayer,
        BcgwNrmRegionsLayer
        // BcgwParksAndEcoreservesLayer,
        // BcgwWildlifeManagementUnitsLayer
      ])
    );
  } else {
    // Feature is a known BCGW feature, fetch any additional mapped region details, and add to the overall response
    const mappedRegionDetails = bcgwLayerService.getMappedRegionDetails([regionDetails]);
    response = response.concat(mappedRegionDetails);
    // Fetch region details for the feature, excluding the layer whose details were already added above
    // Why? We want to avoid querying a layer using a feature from that same layer because the actual results will not
    // be consistent with the expected results. (Ex: LayerA + Feature1 should return Feature1, but will often return
    // Feature1 + Feature2 + Feature3 due to the layer features containing overlapping coordinates, when ideally they
    // should not).
    const layersToProcess = [
      BcgwEnvRegionsLayer,
      BcgwNrmRegionsLayer
      //   BcgwParksAndEcoreservesLayer,
      //   BcgwWildlifeManagementUnitsLayer
    ].filter(
      (layerToProcess) =>
        !mappedRegionDetails.map((mappedRegionDetail) => mappedRegionDetail.sourceLayer).includes(layerToProcess)
    );

    response = response.concat(await getAllRegionDetailsForWktString(geometryWKTString, layersToProcess));
  }

  return response;
}

/**
 * Given a geometry WKT string and array of layers to process, return an array of all matching region details for the
 * specified layers.
 *
 * @param {string} geometryWktString a geometry string in Well-Known Text format
 * @param {string[]} layersToProcess an array of supported layers to query against
 * @return {*}
 */
export async function getAllRegionDetailsForWktString(geometryWktString: string, layersToProcess: string[]) {
  let response: RegionDetails[] = [];

  for (const layerToProcess of layersToProcess) {
    switch (layerToProcess) {
      case BcgwEnvRegionsLayer:
        response = response.concat(await getEnvRegionDetails(geometryWktString));
        break;
      case BcgwNrmRegionsLayer:
        response = response.concat(await getNrmRegionDetails(geometryWktString));
        break;
      case BcgwParksAndEcoreservesLayer:
        response = response.concat(await getParkAndEcoreserveRegionDetails(geometryWktString));
        break;
      case BcgwWildlifeManagementUnitsLayer:
        response = response.concat(await getWildlifeManagementUnitRegionDetails(geometryWktString));
        break;
      default:
        break;
    }
  }

  return response;
}

export async function getEnvRegionDetails(geometryWktString: string): Promise<RegionDetails[]> {
  const bcgwLayerService = new BcgwLayerService();

  const regionNames = await bcgwLayerService.getEnvRegionNames(geometryWktString);

  return regionNames.map((name) => ({ regionName: name, sourceLayer: BcgwEnvRegionsLayer }));
}

export async function getNrmRegionDetails(geometryWktString: string): Promise<RegionDetails[]> {
  const bcgwLayerService = new BcgwLayerService();

  const regionNames = await bcgwLayerService.getNrmRegionNames(geometryWktString);

  return regionNames.map((name) => ({ regionName: name, sourceLayer: BcgwNrmRegionsLayer }));
}

export async function getParkAndEcoreserveRegionDetails(geometryWktString: string): Promise<RegionDetails[]> {
  const bcgwLayerService = new BcgwLayerService();

  const regionNames = await bcgwLayerService.getParkAndEcoreserveRegionNames(geometryWktString);

  return regionNames.map((name) => ({ regionName: name, sourceLayer: BcgwParksAndEcoreservesLayer }));
}

export async function getWildlifeManagementUnitRegionDetails(geometryWktString: string): Promise<RegionDetails[]> {
  const bcgwLayerService = new BcgwLayerService();

  const regionNames = await bcgwLayerService.getWildlifeManagementUnitRegionNames(geometryWktString);

  return regionNames.map((name) => ({ regionName: name, sourceLayer: BcgwWildlifeManagementUnitsLayer }));
}
