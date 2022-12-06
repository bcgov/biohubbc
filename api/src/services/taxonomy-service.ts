import { Client } from '@elastic/elasticsearch';
import { SearchHit, SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('services/taxonomy-service');

export class TaxonomyService {
  private async elasticSearch(searchRequest: SearchRequest) {
    try {
      const client = new Client({ node: process.env.ELASTICSEARCH_URL });
      return client.search({
        index: 'taxonomy_2.0.0',
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
          should: searchConfig
        }
      }
    });

    return response ? this.sanitizeSpeciesData(response.hits.hits) : [];
  }

  private formatScientificName = (data: SearchHit<any>[]) => {
    return data.map((item) => {
      const label = [
        [
          [item._source.unit_name1, item._source.unit_name2, item._source.unit_name3, item._source.taxon_authority]
            .filter(Boolean)
            .join(' ')
        ]
          .filter(Boolean)
          .join(', ')
      ]
        .filter(Boolean)
        .join(': ');

      return { scientific_name: label };
    });
  };

  async getScientificNameBySpeciesCode(code: string) {
    const response = await this.elasticSearch({
      query: {
        term: {
          'code.keyword': code.toUpperCase()
        }
      }
    });

    return response ? this.formatScientificName(response.hits.hits) : [];
  }
}
