import {
  AggregationsAggregate,
  QueryDslBoolQuery,
  SearchHit,
  SearchRequest,
  SearchResponse
} from '@elastic/elasticsearch/lib/api/types';
import axios from 'axios';
import { getLogger } from '../utils/logger';
import { ElasticSearchIndices, ESService } from './es-service';

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
  parent_id: number | null;
  parent_hierarchy: { id: number; level: string }[];
}

export interface IItisSearchResult {
  commonNames: string[];
  kingdom: string;
  name: string;
  parentTSN: string;
  scientificName: string;
  tsn: string;
  updateDate: string;
  usage: string;
}

export interface IEnrichedTaxonomyData {
  scientificName: string;
  englishName: string;
}

/**
 * Service for retrieving and processing taxonomic data from Elasticsearch.
 *
 * @export
 * @class TaxonomyService
 * @extends {ESService}
 */
export class TaxonomyService extends ESService {
  /**
   * Performs a query in Elasticsearch based on the given search criteria
   *
   * @param {SearchRequest} searchRequest The Elastic search request object
   * @return {*}  {(Promise<SearchResponse<ITaxonomySource, Record<string, AggregationsAggregate>> | undefined>)}
   * Promise resolving the search results from Elasticsearch
   * @memberof TaxonomyService
   */
  async elasticSearch(
    searchRequest: SearchRequest
  ): Promise<SearchResponse<ITaxonomySource, Record<string, AggregationsAggregate>> | undefined> {
    try {
      const esClient = await this.getEsClient();

      return esClient.search({
        index: ElasticSearchIndices.TAXONOMY,
        ...searchRequest
      });
    } catch (error) {
      defaultLog.debug({ label: 'elasticSearch', message: 'error', error });
    }
  }

  /**
   * Returns the ITIS search species Query.
   *
   * @param {*} searchRequest
   * @return {*}  {(Promise<any | undefined>)}
   * @memberof TaxonomyService
   */
  async itisSearch(searchRequest: any): Promise<any | undefined> {
    try {
      const itisClient = await this.getItisSearchUrl(searchRequest);

      const response = await axios.get(itisClient);

      if (!response.data || !response.data.response || !response.data.response.docs) {
        return [];
      }

      const taxonomySpecies = this._sanitizeItisData(response.data.response.docs);

      return taxonomySpecies;
    } catch (error) {
      defaultLog.debug({ label: 'itisSearch', message: 'error', error });
    }
  }

  _sanitizeItisData = (data: IItisSearchResult[]): { id: string; label: string; scientificName: string }[] => {
    return data.map((item: IItisSearchResult) => {
      const commonName = (item.commonNames && item.commonNames[0].split('$')[1]) || item.scientificName;

      return {
        id: item.tsn,
        label: commonName,
        scientificName: item.scientificName
      };
    });
  };

  _getFocalSpeciesFromBiohub = async (
    ids: string[] | number[]
  ): Promise<{ id: number; label: string; scientificName: string }[]> => {
    const speciesDummyData = [
      {
        id: 1,
        label: 'Species 1',
        scientificName: 'Scientific Name 1'
      },
      {
        id: 2,
        label: 'Species 2',
        scientificName: 'Scientific Name 2'
      },
      {
        id: 3,
        label: 'Species 3',
        scientificName: 'Scientific Name 3'
      },
      {
        id: 4,
        label: 'Species 4',
        scientificName: 'Scientific Name 4'
      },
      {
        id: 5,
        label: 'Species 5',
        scientificName: 'Scientific Name 5'
      }
    ];

    const idsLength = ids.length;

    const sliceSpecies = speciesDummyData.slice(0, idsLength);

    return sliceSpecies;
  };

  _getAncillarySpeciesFromBiohub = async (
    ids: string[] | number[]
  ): Promise<{ id: number; label: string; scientificName: string }[]> => {
    const speciesDummyData = [
      { id: 6, label: 'Species 6', scientificName: 'Scientific Name 6' },
      {
        id: 7,
        label: 'Species 7',
        scientificName: 'Scientific Name 7'
      },
      {
        id: 8,
        label: 'Species 8',
        scientificName: 'Scientific Name 8'
      },
      {
        id: 9,
        label: 'Species 9',
        scientificName: 'Scientific Name 9'
      },
      {
        id: 10,
        label: 'Species 10',
        scientificName: 'Scientific Name 10'
      }
    ];

    const idsLength = ids.length;

    const sliceSpecies = speciesDummyData.slice(0, idsLength);

    return sliceSpecies;
  };

  /**
   * Sanitizes species data retrieved from Elasticsearch.
   *
   * @param {SearchHit<ITaxonomySource>[]} data The data response from ElasticSearch
   * @return {*}  {{ id: string; label: string }[]} An ID and label pair for each taxonomic code
   * @memberof TaxonomyService
   */
  _sanitizeSpeciesData = (data: SearchHit<ITaxonomySource>[]): { id: string; label: string }[] => {
    return data.map((item: SearchHit<ITaxonomySource>) => {
      const { _id: id, _source } = item;

      const label = [
        [
          _source?.english_name,
          [_source?.unit_name1, _source?.unit_name2, _source?.unit_name3].filter(Boolean).join(' ')
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
   * Searches the taxonomy Elasticsearch index by taxonomic code IDs
   *
   * @param {string[] | number[]} ids The array of taxonomic code IDs
   * @return {Promise<SearchHit<ITaxonomySource>[]>} The response from Elasticsearch
   * @memberof TaxonomyService
   */
  async getTaxonomyFromIds(ids: string[] | number[]): Promise<SearchHit<ITaxonomySource>[]> {
    defaultLog.debug({ label: 'getTaxonomyFromIds' });

    const response = await this.elasticSearch({
      query: {
        terms: {
          _id: ids
        }
      }
    });

    if (!response) {
      return [];
    }

    return response.hits.hits;
  }

  /**
   * Searches the taxonomy Elasticsearch index by taxonomic code IDs and santizes the response
   *
   * @param {string[] | number[]} ids The array of taxonomic code IDs
   * @returns {Promise<{ id: string, label: string}[]>} Promise resolving an ID and label pair for each taxonomic code
   * @memberof TaxonomyService
   */
  async getSpeciesFromIds(ids: string[] | number[]): Promise<{ id: string; label: string }[]> {
    const response = await this.elasticSearch({
      query: {
        terms: {
          _id: ids
        }
      }
    });

    return response ? this._sanitizeSpeciesData(response.hits.hits) : [];
  }

  /**
   * Maps a taxonomic search term to an Elasticsearch query, then performs the query and sanitizes the response.
   * The query also includes a boolean match to only include records whose `end_date` field is either
   * undefined/null or is a date that hasn't occurred yet. This filtering is not done on similar ES queries,
   * since we must still be able to search by a given taxonomic code ID, even if is one that is expired.
   *
   * @param {string} term The search term string
   * @returns {Promise<{ id: string, label: string}[]>} Promise resolving an ID and label pair for each taxonomic code
   * @memberof TaxonomyService
   */
  async searchSpecies(term: string): Promise<{ id: string; label: string }[]> {
    const searchConfig: object[] = [];

    const splitTerms = term.split(' ');

    splitTerms.forEach((item) => {
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

    const response = await this.elasticSearch({
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

  _formatEnrichedData = (data: SearchHit<ITaxonomySource>): IEnrichedTaxonomyData => {
    const scientificName =
      [data._source?.unit_name1, data._source?.unit_name2, data._source?.unit_name3].filter(Boolean).join(' ') || '';
    const englishName = data._source?.english_name || '';

    return { scientificName, englishName };
  };

  /**
   * Fetch formatted taxonomy information for a specific taxon code.
   *
   * @param {string} taxonCode
   * @return {*}  {(Promise<IEnrichedTaxonomyData | null>)}
   * @memberof TaxonomyService
   */
  async getEnrichedDataForSpeciesCode(taxonCode: string): Promise<IEnrichedTaxonomyData | null> {
    const response = await this.elasticSearch({
      query: {
        bool: {
          must: [
            {
              term: {
                'code.keyword': taxonCode.toUpperCase()
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
                  }
                ]
              }
            }
          ]
        } as QueryDslBoolQuery
      }
    });

    return response?.hits.hits.length ? this._formatEnrichedData(response.hits.hits[0]) : null;
  }
}
