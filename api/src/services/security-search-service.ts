import { Client } from '@elastic/elasticsearch';
// import { SearchHit, SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('services/security-search-service');

export class SecuritySearchService {

  proprietarySecurityIndex = "proprietary_security_1.0.0";
  persecutionSecurityIndex = "persecution_security_1.0.0";

  private async elasticSearch(index: String) {
    try {
      const client = new Client({ node: process.env.ELASTICSEARCH_URL });
      return client.search({
        index: 'taxonomy'
      });
    } catch (error) {
      defaultLog.debug({ label: 'elasticSearch', message: 'error', error });
    }  
  }

  async getProprietarySecurityRules() {
    const response = await this.elasticSearch(this.proprietarySecurityIndex);
    console.log(response)
  }
}