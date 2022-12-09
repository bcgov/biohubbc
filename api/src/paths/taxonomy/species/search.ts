import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { TaxonomyService } from '../../../services/taxonomy-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/taxonomy/search');

export const GET: Operation = [searchSpecies()];

GET.apiDoc = {
  description: 'Gets a list of taxonomic units.',
  tags: ['taxonomy'],
  parameters: [
    {
      description: 'Taxonomy search parameters.',
      in: 'query',
      name: 'terms',
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
                  required: ['id', 'label'],
                  properties: {
                    id: {
                      type: 'string'
                    },
                    label: {
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
export function searchSpecies(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getSearchResults', message: 'request params', req_params: req.query.terms });

    const term = String(req.query.terms) || '';
    try {
      const taxonomySearch = new TaxonomyService();
      const response = await taxonomySearch.searchSpecies(term.toLowerCase());

      res.status(200).json({ searchResponse: response });
    } catch (error) {
      defaultLog.error({ label: 'getSearchResults', message: 'error', error });
      throw error;
    }
  };
}
