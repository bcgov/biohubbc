import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import qs from 'qs';
import { getAPIUserDBConnection } from '../../../database/db';
import { PlatformService } from '../../../services/platform-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/taxonomy/species/list');

export const GET: Operation = [getTaxonomyByTsns()];

GET.apiDoc = {
  description: 'Gets the labels of the taxonomic units identified by the provided list of ids.',
  tags: ['taxonomy'],
  parameters: [
    {
      description: 'ITIS TSNs.',
      in: 'query',
      name: 'tsn',
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
                      type: 'integer'
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
export function getTaxonomyByTsns(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getTaxonomyByTsns', message: 'query', query: req.query });

    const tsns = Object.values(qs.parse(req.query.tsn?.toString() || ''))
      .map(String)
      .filter(Boolean);

    const connection = getAPIUserDBConnection();

    try {
      const platformService = new PlatformService(connection);
      const response = await platformService.getTaxonomyByTsns(tsns);

      // Overwrite default cache-control header, allow caching up to 7 days
      res.setHeader('Cache-Control', 'max-age=604800');

      res.status(200).json({ searchResponse: response });
    } catch (error) {
      defaultLog.error({ label: 'getTaxonomyByTsns', message: 'error', error });
      throw error;
    }
  };
}
