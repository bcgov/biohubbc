import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import qs from 'qs';
import { getDBConnection } from '../../../database/db';
import { PlatformService } from '../../../services/platform-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/taxonomy/list');

export const GET: Operation = [getSpeciesFromIds()];

GET.apiDoc = {
  description: 'Gets the labels of the taxonomic units identified by the provided list of ids.',
  tags: ['taxonomy'],
  parameters: [
    {
      description: 'Taxonomy ids.',
      in: 'query',
      name: 'ids',
      required: true,
      schema: {
        type: 'string'
      }
    }
  ],
  responses: {
    200: {
      description: 'Taxonomy search response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              searchResponse: {
                type: 'array',
                items: {
                  title: 'Species',
                  type: 'object',
                  required: ['tsn', 'commonName', 'scientificName'],
                  properties: {
                    tsn: {
                      type: 'string'
                    },
                    commonName: {
                      type: 'string',
                      nullable: true
                    },
                    scientificName: {
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
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get taxonomic search results.
 *
 * @returns {RequestHandler}
 */
export function getSpeciesFromIds(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getSpeciesFromIds', message: 'query', query: req.query });

    const connection = getDBConnection(req['keycloak_token']);

    const ids = Object.values(qs.parse(req.query.ids?.toString() || ''));

    try {
      const platformService = new PlatformService(connection);
      const response = await platformService.getTaxonomyFromBiohub(ids as string[]);

      // Overwrite default cache-control header, allow caching up to 7 days
      res.setHeader('Cache-Control', 'max-age=604800');

      res.status(200).json({ searchResponse: response });
    } catch (error) {
      defaultLog.error({ label: 'getSearchResults', message: 'error', error });
      throw error;
    }
  };
}
