import { Client } from '@elastic/elasticsearch';
import { SearchHit, SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('services/taxonomy-service');

export class TaxonomyService {
  private async elasticSearch(searchRequest: SearchRequest) {
    try {
      const client = new Client({ node: process.env.ELASTICSEARCH_URL });
      return await client.search({
        index: 'taxonomy',
        ...searchRequest
      });
    } catch (error) {
      defaultLog.debug({ label: 'elasticSearch', message: 'error', error });
    }
  }

  private sanitizeSpeciesData = (data: SearchHit<any>[]) => {
    return data.map((item) => {
      const label = [
        item._source.code,
        [
          [item._source.tty_kingdom, item._source.tty_name].filter(Boolean).join(' '),
          [item._source.unit_name1, item._source.unit_name2, item._source.unit_name3].filter(Boolean).join(' '),
          item._source.english_name
        ]
          .filter(Boolean)
          .join(', ')
      ]
        .filter(Boolean)
        .join(': ');

      return { id: item._id, label: label };
    });
  };

  async getTaxonomyFromIds(ids: number[]) {
    const response = await this.elasticSearch({
      query: {
        terms: {
          _id: ids
        }
      }
    });

    return (response && response.hits.hits.map((item) => item._source)) || [];
  }

  async getSpeciesFromIds(ids: string[]) {
    const response = await this.elasticSearch({
      query: {
        terms: {
          _id: ids
        }
      }
    });

    return response ? this.sanitizeSpeciesData(response.hits.hits) : [];
  }

  async searchSpecies(term: string) {
    const response = await this.elasticSearch({
      query: {
        bool: {
          should: [
            { wildcard: { english_name: { value: `*${term}*`, boost: 4.0 } } },
            { wildcard: { unit_name1: { value: `*${term}*`, boost: 3.0 } } },
            { wildcard: { unit_name2: { value: `*${term}*`, boost: 3.0 } } },
            { wildcard: { unit_name3: { value: `*${term}*`, boost: 3.0 } } },
            { wildcard: { code: { value: `*${term}*`, boost: 2.0 } } },
            { wildcard: { tty_kingdom: { value: `*${term}*`, boost: 1.0 } } }
          ]
        }
      }
    });

    return response ? this.sanitizeSpeciesData(response.hits.hits) : [];
  }
}
