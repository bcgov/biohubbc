import { AggregationsAggregate, SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ITaxonomySource, TaxonomyService } from './taxonomy-service';

chai.use(sinonChai);

describe('TaxonomyService', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockElasticResponse: SearchResponse<ITaxonomySource, Record<string, AggregationsAggregate>> | undefined = {
    took: 0,
    timed_out: false,
    _shards: {
      failed: 0,
      successful: 1,
      total: 1
    },
    hits: {
      hits: []
    }
  };

  it('constructs', () => {
    const taxonomyService = new TaxonomyService();
    expect(taxonomyService).to.be.instanceof(TaxonomyService);
  });

  describe('getTaxonomyFromIds', async () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should query elasticsearch and return []', async () => {
      process.env.ELASTICSEARCH_TAXONOMY_INDEX = 'taxonomy_test_3.0.0';

      const taxonomyService = new TaxonomyService();

      const elasticSearchStub = sinon.stub(taxonomyService, 'elasticSearch').resolves(undefined);

      const response = await taxonomyService.getTaxonomyFromIds([1]);

      expect(elasticSearchStub).to.be.calledOnce;
      expect(response).to.eql([]);
    });

    it('should query elasticsearch and return taxonomy', async () => {
      process.env.ELASTICSEARCH_TAXONOMY_INDEX = 'taxonomy_test_3.0.0';

      const taxonomyService = new TaxonomyService();

      const taxonDetails: Omit<ITaxonomySource, 'end_date'> = {
        unit_name1: 'A',
        unit_name2: 'B',
        unit_name3: 'C',
        taxon_authority: 'taxon_authority',
        code: 'D',
        tty_kingdom: 'kingdom',
        tty_name: 'name',
        english_name: 'animal',
        note: null,
        parent_id: 1,
        parent_hierarchy: []
      };

      const elasticSearchStub = sinon.stub(taxonomyService, 'elasticSearch').resolves({
        ...mockElasticResponse,
        hits: {
          hits: [
            {
              _index: process.env.ELASTICSEARCH_TAXONOMY_INDEX,
              _id: '1',
              _source: {
                ...taxonDetails,
                end_date: null
              }
            }
          ]
        }
      });

      const response = await taxonomyService.getTaxonomyFromIds([1]);

      expect(elasticSearchStub).to.be.calledOnce;

      expect(response).to.eql([
        {
          _index: process.env.ELASTICSEARCH_TAXONOMY_INDEX,
          _id: '1',
          _source: {
            ...taxonDetails,
            end_date: null
          }
        }
      ]);
    });
  });

  describe('getSpeciesFromIds', async () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should query elasticsearch and return []', async () => {
      process.env.ELASTICSEARCH_TAXONOMY_INDEX = 'taxonomy_test_3.0.0';

      const taxonomyService = new TaxonomyService();

      const elasticSearchStub = sinon.stub(taxonomyService, 'elasticSearch').resolves(undefined);

      const response = await taxonomyService.getSpeciesFromIds(['1']);

      expect(elasticSearchStub).to.be.calledOnce;
      expect(response).to.eql([]);
    });

    it('should query elasticsearch and return sanitized data', async () => {
      process.env.ELASTICSEARCH_TAXONOMY_INDEX = 'taxonomy_test_3.0.0';

      const taxonomyService = new TaxonomyService();

      const taxonDetails: Omit<ITaxonomySource, 'end_date'> = {
        unit_name1: 'A',
        unit_name2: 'B',
        unit_name3: 'C',
        taxon_authority: 'taxon_authority',
        code: 'D',
        tty_kingdom: 'kingdom',
        tty_name: 'name',
        english_name: 'animal',
        note: null,
        parent_id: 1,
        parent_hierarchy: []
      };

      const elasticSearchStub = sinon.stub(taxonomyService, 'elasticSearch').resolves({
        ...mockElasticResponse,
        hits: {
          hits: [
            {
              _index: process.env.ELASTICSEARCH_TAXONOMY_INDEX,
              _id: '1',
              _source: {
                ...taxonDetails,
                end_date: null
              }
            }
          ]
        }
      });

      const sanitizeSpeciesDataStub = sinon.spy(taxonomyService, '_sanitizeSpeciesData');

      const response = await taxonomyService.getSpeciesFromIds(['1']);

      expect(elasticSearchStub).to.be.calledOnce;
      expect(sanitizeSpeciesDataStub).to.be.calledOnce;
      expect(response).to.eql([{ id: '1', label: 'D: kingdom name, A B C, animal' }]);
    });
  });

  describe('searchSpecies', async () => {
    it('should query elasticsearch', async () => {
      process.env.ELASTICSEARCH_TAXONOMY_INDEX = 'taxonomy_test_3.0.0';

      const taxonomyService = new TaxonomyService();

      const taxonDetails: Omit<ITaxonomySource, 'end_date'> = {
        unit_name1: 'A',
        unit_name2: 'B',
        unit_name3: 'C',
        taxon_authority: 'taxon_authority',
        code: 'D',
        tty_kingdom: 'kingdom',
        tty_name: 'name',
        english_name: 'animal',
        note: null,
        parent_id: 1,
        parent_hierarchy: []
      };

      const elasticSearchStub = sinon.stub(taxonomyService, 'elasticSearch').resolves({
        ...mockElasticResponse,
        hits: {
          hits: [
            {
              _index: process.env.ELASTICSEARCH_TAXONOMY_INDEX,
              _id: '1',
              _source: {
                ...taxonDetails,
                end_date: null
              }
            },
            {
              _index: process.env.ELASTICSEARCH_TAXONOMY_INDEX,
              _id: '2',
              _source: {
                ...taxonDetails,
                end_date: '2010-01-01'
              }
            },
            {
              _index: process.env.ELASTICSEARCH_TAXONOMY_INDEX,
              _id: '3',
              _source: {
                ...taxonDetails,
                end_date: '2040-01-01'
              }
            }
          ]
        }
      });

      taxonomyService.searchSpecies('search term');

      expect(elasticSearchStub).to.be.calledOnce;
    });
  });
});
