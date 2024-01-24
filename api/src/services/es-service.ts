import { Client } from '@elastic/elasticsearch';

export const ElasticSearchIndices = {
  TAXONOMY: process.env.ELASTICSEARCH_TAXONOMY_INDEX || 'taxonomy_3.0.0'
};

export const ITIS_PARAMS = {
  SORT: 'wt=json&sort=nameWOInd+asc&rows=25',
  FILTER: 'omitHeader=true&fl=tsn+scientificName:nameWOInd+kingdom+parentTSN+commonNames:vernacular+updateDate+usage'
};

/**
 * Base class for services that require a elastic search connection.
 *
 * @export
 * @class ESService
 */
export class ESService {
  esClient: Client | undefined = undefined;

  /**
   * Returns the Elasticsearch Client instance. If `this.esClient` isn't defined,
   * a new Elasticsearch Client is instantiated.
   *
   * @return {*}  {Promise<Client>}
   * @memberof ESService
   */
  async getEsClient(): Promise<Client> {
    if (!this.esClient) {
      this.esClient = await new Client({ node: process.env.ELASTICSEARCH_URL });
    }
    return this.esClient;
  }

  /**
   * Returns the ITIS search URL.
   *
   * @param {string} searchParams
   * @return {*}  {Promise<string>}
   * @memberof ESService
   */
  async getItisSearchUrl(searchParams: string): Promise<string> {
    const itisUrl = process.env.ITIS_URL;
    if (!itisUrl) {
      throw new Error('ITIS_SEARCH_URL not defined.');
    }
    const itisSearchSpecies = this._getItisSearchSpeciesQuery(searchParams);

    return `${itisUrl}?${ITIS_PARAMS.SORT}&${itisSearchSpecies}&${ITIS_PARAMS.FILTER}`;
  }

  /**
   * Returns the ITIS search species Query.
   *
   * @param {string} searchSpecies
   * @return {*}  {string}
   * @memberof ESService
   */
  _getItisSearchSpeciesQuery(searchSpecies: string): string {
    return `q=(nameWOInd:*${searchSpecies}*+AND+usage:/(valid|accepted)/)+(vernacular:*${searchSpecies}*+AND+usage:/(valid|accepted)/)`;
  }
}
