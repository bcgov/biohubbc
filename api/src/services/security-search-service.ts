import { Client } from '@elastic/elasticsearch';
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('services/security-search-service');

interface ISecurityProsecutionSource {
  description: string;
  type: string;
  taxon: {
    code: string;
  };
}

interface ISecurityProprietySource {
  description: string;
  name: string;
}
export class SecuritySearchService {
  private proprietarySecurityIndex = 'proprietary_security_1.0.0';
  private persecutionSecurityIndex = 'persecution_security_1.0.0';

  private async elasticSearch(index: string, searchRequest?: SearchRequest) {
    try {
      const client = new Client({ node: process.env.ELASTICSEARCH_URL });
      return client.search({
        index: `${index}`
      });
    } catch (error) {
      defaultLog.debug({ label: 'elasticSearch', message: 'error', error });
    }
  }

  async getProprietarySecurityRules(): Promise<any[]> {
    const response = await this.elasticSearch(this.proprietarySecurityIndex);

    return (
      response?.hits.hits.map((item) => {
        return {
          security_reason_id: item._id,
          category: (item._source as ISecurityProprietySource).name,
          reasonTitle: (item._source as ISecurityProprietySource).name,
          reasonDescription: (item._source as ISecurityProprietySource).description,
          expirationDate: null
        };
      }) || []
    );
  }

  async getPersecutionSecurityRules(): Promise<any[]> {
    const response = await this.elasticSearch(this.persecutionSecurityIndex);
    return (
      response?.hits.hits.map((item) => {
        return {
          security_reason_id: item._id,
          category: (item._source as ISecurityProsecutionSource).taxon.code,
          reasonTitle: (item._source as ISecurityProsecutionSource).type,
          reasonDescription: (item._source as ISecurityProsecutionSource).description,
          expirationDate: null
        };
      }) || []
    );
  }

  async getPersecutionSecurityFromIds(ids: number[]): Promise<any[]> {
    const response = await this.elasticSearch(this.persecutionSecurityIndex, {
      query: {
        terms: {
          _id: ids
        }
      }
    });

    return this.mapProsecutionItems(response?.hits.hits || [])
  }
  
  mapProsecutionItems(items: any[]): any[] {
    return items.map(item => {
      return {
        security_reason_id: item._id,
        category: (item._source as ISecurityProsecutionSource).taxon.code,
        reasonTitle: (item._source as ISecurityProsecutionSource).type,
        reasonDescription: (item._source as ISecurityProsecutionSource).description,
        expirationDate: null
      };
    })
  }
}
