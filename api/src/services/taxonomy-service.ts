import { Client } from '@elastic/elasticsearch';
import {
  AggregationsAggregate,
  QueryDslBoolQuery,
  SearchHit,
  SearchRequest,
  SearchResponse
} from '@elastic/elasticsearch/lib/api/types';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('services/taxonomy-service');

export interface ITaxonomySource {
  unit_name1: string;
  unit_name2: string;
  unit_name3: string;
  taxon_authority: string;
  code: string;
  tty_kingdom: string;
  tty_name: string;
  english_name: string;
  note: string | null;
  end_date: string | null;
}

/**
 *
 * Service for retreiving and processing taxonomic data from Elasticsearch.
 */
export class TaxonomyService {
  /**
   *
   * Performs a query in Elasticsearch based on the given search criteria
   * @param {SearchRequest} searchRequest The Elastic search request object
   * @returns {Promise<SearchResponse<ITaxonomySource, Record<string, AggregationsAggregate>> | undefined>}
   * Promise resolving the search results from Elasticsearch
   */
  async _elasticSearch(
    searchRequest: SearchRequest
  ): Promise<SearchResponse<ITaxonomySource, Record<string, AggregationsAggregate>> | undefined> {
    try {
      defaultLog.debug({ label: '_elasticSearch', searchRequest });
      const client = new Client({ node: process.env.ELASTICSEARCH_URL });

      return client.search({
        index: process.env.ELASTICSEARCH_TAXONOMY_INDEX,
        ...searchRequest
      });
    } catch (error) {
      defaultLog.debug({ label: 'elasticSearch', message: 'error', error });
    }
  }

  /**
   *
   * Sanitizes species data retrieved from Elasticsearch.
   * @param {SearchHit<ITaxonomySource>[]} data The data response fromEelasticsearch
   * @returns {{ id: string, label: string }[]} An ID and label pair for each taxonomic code
   * @memberof TaxonomyService
   */
  _sanitizeSpeciesData = (data: SearchHit<ITaxonomySource>[]): { id: string; label: string }[] => {
    return data.map((item: SearchHit<ITaxonomySource>) => {
      const { _id: id, _source } = item;

      const label = [
        _source?.code,
        [
          [_source?.tty_kingdom, _source?.tty_name].filter(Boolean).join(' '),
          [_source?.unit_name1, _source?.unit_name2, _source?.unit_name3].filter(Boolean).join(' '),
          _source?.english_name
        ]
          .filter(Boolean)
          .join(', ')
      ]
        .filter(Boolean)
        .join(': ');

      return { id, label };
    });
  };

  /**
   *
   * Searches the taxonomy Elasticsearch index by taxonomic code IDs
   * @param {string[] | number[]} ids The array of taxonomic code IDs
   * @return {Promise<(ITaxonomySource | undefined)[]>} The source of the response from Elasticsearch
   * @memberof TaxonomyService
   */
  async getTaxonomyFromIds(ids: string[] | number[]) {
    const response = await this._elasticSearch({
      query: {
        terms: {
          _id: ids
        }
      }
    });

    return (response && response.hits.hits.map((item) => item._source)) || [];
  }

  /**
   *
   * Searches the taxonomy Elasticsearch index by taxonomic code IDs and santizes the response
   * @param {string[] | number[]} ids The array of taxonomic code IDs
   * @returns {Promise<{ id: string, label: string}[]>} Promise resolving an ID and label pair for each taxonomic code
   * @memberof TaxonomyService
   */
  async getSpeciesFromIds(ids: string[] | number[]): Promise<{ id: string; label: string }[]> {
    const response = await this._elasticSearch({
      query: {
        terms: {
          _id: ids
        }
      }
    });

    return response ? this._sanitizeSpeciesData(response.hits.hits) : [];
  }

  /**
   *
   * Maps a taxonomic search term to an Elasticsearch query, then performs the query and sanitizes the response
   * @param {string} term The search term string
   * @returns {Promise<{ id: string, label: string}[]>} Promise resolving an ID and label pair for each taxonomic code
   * @memberof TaxonomyService
   */
  async searchSpecies(term: string): Promise<{ id: string; label: string }[]> {
    const searchConfig: object[] = [];

    const splitTerms = term.split(' ');

    splitTerms.forEach((item: string) => {
      searchConfig.push({
        wildcard: {
          english_name: { value: `*${item}*`, boost: 4.0, case_insensitive: true }
        }
      });
      searchConfig.push({
        wildcard: { unit_name1: { value: `*${item}*`, boost: 3.0, case_insensitive: true } }
      });
      searchConfig.push({
        wildcard: { unit_name2: { value: `*${item}*`, boost: 3.0, case_insensitive: true } }
      });
      searchConfig.push({
        wildcard: { unit_name3: { value: `*${item}*`, boost: 3.0, case_insensitive: true } }
      });
      searchConfig.push({ wildcard: { code: { value: `*${item}*`, boost: 2, case_insensitive: true } } });
      searchConfig.push({
        wildcard: { tty_kingdom: { value: `*${item}*`, boost: 1.0, case_insensitive: true } }
      });
    });

    const response = await this._elasticSearch({
      query: {
        bool: {
          must: [
            {
              bool: {
                should: searchConfig
              }
            },
            {
              bool: {
                minimum_should_match: 1,
                should: [
                  {
                    bool: {
                      must_not: {
                        exists: {
                          field: 'end_date'
                        }
                      }
                    }
                  },
                  {
                    range: {
                      end_date: {
                        gt: 'now'
                      }
                    }
                  }
                ]
              }
            }
          ]
        } as QueryDslBoolQuery
      }
    });

    return response ? this._sanitizeSpeciesData(response.hits.hits) : [];
  }
}
