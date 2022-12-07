import { Client } from '@elastic/elasticsearch';
import { AggregationsAggregate, SearchRequest, SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ITaxonomySource, TaxonomyService } from './taxonomy-service';

chai.use(sinonChai);

describe('TaxonomyService', () => {
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
  }

  it('constructs', () => {
    const taxonomyService = new TaxonomyService();

    expect(taxonomyService).to.be.instanceof(TaxonomyService);
  });

  describe('elasticSearch', async () => {
    process.env.ELASTICSEARCH_TAXONOMY_INDEX = 'taxonomy_test_2.0.0';

    it('should have results whose search index matches the search index in the request, namely ELASTICSEARCH_TAXONOMY_INDEX', async () => {

    })
  })

  describe('searchSpecies', async () => {
    process.env.ELASTICSEARCH_TAXONOMY_INDEX = 'taxonomy_test_2.0.0';

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
    }

    const elasticSearchStub = sinon.stub(taxonomyService, '_elasticSearch').resolves({
      ...mockElasticResponse,
      hits: {
        hits: [
          {
            _index: process.env.ELASTICSEARCH_TAXONOMY_INDEX,
            _id: '1',
            _source: {
              ...taxonDetails,
              end_date: null,
            }
          },
          {
            _index: process.env.ELASTICSEARCH_TAXONOMY_INDEX,
            _id: '2',
            _source: {
              ...taxonDetails,
              end_date: '2010-01-01',
            }
          },
          {
            _index: process.env.ELASTICSEARCH_TAXONOMY_INDEX,
            _id: '3',
            _source: {
              ...taxonDetails,
              end_date: '2040-01-01',
            }
          }
        ]
      }
    });

  
    it('should send the expected query paramters to Elastic', async () => {
      process.env.ELASTICSEARCH_TAXONOMY_INDEX = 'taxonomy_test_2.0.0';

      const mockSearchRequest: SearchRequest = {

      }

      const clientStub = sinon.stub(Client.prototype)

      const taxonomyService = new TaxonomyService();

      const elasticSearchStub = sinon.stub(taxonomyService, '_elasticSearch').resolves(mockElasticResponse);

      expect(elasticSearchStub).to.be.called.with(mockSearchRequest)
      expect(clientStub).to.be.called.with([mcokSearchRequest, 'taxonomy_test_2.0.0'])
    })

    it('should map resolve with the expected id and label pairs based on the given Elastic response', async () => {
      
    })
  })

  describe('sanitizeSpeciesData', async () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should filter out species codes that have expired', async () => {
      


      const taxonomyService = new TaxonomyService();

      

      const filtered = taxonomyService._sanitizeSpeciesData(mockElasticSearch)
      expect
    });

    it('should not filter out species codes that have undefined end dates', () => {
      //
    });

    it('should only filter out species codes whose end date has already passed', async () => {
      //
    });
  });

  describe('isValidTaxonomySource', async () => {
    //
  });
});
