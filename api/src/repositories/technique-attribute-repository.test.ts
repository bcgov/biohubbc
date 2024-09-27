import { fail } from 'assert';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import {
  IQualitativeAttributePostData,
  IQuantitativeAttributePostData,
  TechniqueAttributeRepository,
  TechniqueAttributesLookupObject,
  TechniqueAttributesObject
} from './technique-attribute-repository';

chai.use(sinonChai);

describe('TechniqueAttributeRepository', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('getAttributeDefinitionsByMethodLookupIds', () => {
    it('should run successfully', async () => {
      const mockRecord: TechniqueAttributesLookupObject = {
        method_lookup_id: 1,
        qualitative_attributes: [],
        quantitative_attributes: []
      };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueAttributeRepository(dbConnection);

      const methodLookupIds = [1];

      const response = await repository.getAttributeDefinitionsByMethodLookupIds(methodLookupIds);

      expect(response).to.eql([mockRecord]);
    });
  });

  describe('getAttributeDefinitionsByTechniqueId', () => {
    it('should run successfully', async () => {
      const mockRecord: TechniqueAttributesLookupObject = {
        method_lookup_id: 1,
        qualitative_attributes: [],
        quantitative_attributes: []
      };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueAttributeRepository(dbConnection);

      const methodTechniqueId = 1;

      const response = await repository.getAttributeDefinitionsByTechniqueId(methodTechniqueId);

      expect(response).to.eql(mockRecord);
    });
  });

  describe('getAttributesByTechniqueId', () => {
    it('should run successfully', async () => {
      const mockRecord: TechniqueAttributesObject = {
        qualitative_attributes: [],
        quantitative_attributes: []
      };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueAttributeRepository(dbConnection);

      const methodTechniqueId = 1;

      const response = await repository.getAttributesByTechniqueId(methodTechniqueId);

      expect(response).to.eql(mockRecord);
    });
  });

  describe('insertQualitativeAttributesForTechnique', () => {
    it('should return undefined if no attributes provided', async () => {
      const dbConnection = getMockDBConnection({ knex: () => fail() });

      const repository = new TechniqueAttributeRepository(dbConnection);

      const methodTechniqueId = 1;
      const attributes: IQualitativeAttributePostData[] = [];

      const response = await repository.insertQualitativeAttributesForTechnique(methodTechniqueId, attributes);

      expect(response).to.be.undefined;
    });

    it('should run successfully', async () => {
      const mockRecord = { method_technique_attribute_qualitative_id: 1 };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueAttributeRepository(dbConnection);

      const methodTechniqueId = 1;
      const attributes: IQualitativeAttributePostData[] = [
        {
          method_technique_attribute_qualitative_id: 1,
          method_lookup_attribute_qualitative_option_id: '123-456-22',
          method_lookup_attribute_qualitative_id: '123-456-33'
        }
      ];

      const response = await repository.insertQualitativeAttributesForTechnique(methodTechniqueId, attributes);

      expect(response).to.eql([mockRecord]);
    });
  });

  describe('insertQuantitativeAttributesForTechnique', () => {
    it('should return undefined if no attributes provided', async () => {
      const dbConnection = getMockDBConnection({ knex: () => fail() });

      const repository = new TechniqueAttributeRepository(dbConnection);

      const methodTechniqueId = 1;
      const attributes: IQuantitativeAttributePostData[] = [];

      const response = await repository.insertQuantitativeAttributesForTechnique(methodTechniqueId, attributes);

      expect(response).to.be.undefined;
    });

    it('should run successfully', async () => {
      const mockRecord = { method_technique_attribute_quantitative_id: 1 };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueAttributeRepository(dbConnection);

      const methodTechniqueId = 1;
      const attributes: IQuantitativeAttributePostData[] = [
        {
          method_technique_attribute_quantitative_id: 1,
          method_lookup_attribute_quantitative_id: '123-456-22',
          value: 3
        }
      ];

      const response = await repository.insertQuantitativeAttributesForTechnique(methodTechniqueId, attributes);

      expect(response).to.eql([mockRecord]);
    });
  });

  describe('updateQuantitativeAttributeForTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord = { method_technique_attribute_quantitative_id: 1 };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueAttributeRepository(dbConnection);

      const methodTechniqueId = 1;
      const attribute: IQuantitativeAttributePostData = {
        method_technique_attribute_quantitative_id: 1,
        method_lookup_attribute_quantitative_id: '123-456-22',
        value: 3
      };

      const response = await repository.updateQuantitativeAttributeForTechnique(methodTechniqueId, attribute);

      expect(response).to.eql(mockRecord);
    });
  });

  describe('updateQualitativeAttributeForTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord = { method_technique_attribute_qualitative_id: 1 };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueAttributeRepository(dbConnection);

      const methodTechniqueId = 1;
      const attribute: IQualitativeAttributePostData = {
        method_technique_attribute_qualitative_id: 1,
        method_lookup_attribute_qualitative_option_id: '123-456-22',
        method_lookup_attribute_qualitative_id: '123-456-33'
      };

      const response = await repository.updateQualitativeAttributeForTechnique(methodTechniqueId, attribute);

      expect(response).to.eql(mockRecord);
    });
  });

  describe('deleteQualitativeAttributesForTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord = { method_technique_attribute_qualitative_id: 1 };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueAttributeRepository(dbConnection);

      const surveyId = 1;
      const methodTechniqueId = 2;
      const methodTechniqueAttributeQualitativeIds = [3, 4];

      const response = await repository.deleteQualitativeAttributesForTechnique(
        surveyId,
        methodTechniqueId,
        methodTechniqueAttributeQualitativeIds
      );

      expect(response).to.eql([mockRecord]);
    });
  });

  describe('deleteQuantitativeAttributesForTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord = { method_technique_attribute_quantitative_id: 1 };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueAttributeRepository(dbConnection);

      const surveyId = 1;
      const methodTechniqueId = 2;
      const methodTechniqueAttributeQuantitativeIds = [3, 4];

      const response = await repository.deleteQuantitativeAttributesForTechnique(
        surveyId,
        methodTechniqueId,
        methodTechniqueAttributeQuantitativeIds
      );

      expect(response).to.eql([mockRecord]);
    });
  });

  describe('deleteAllTechniqueAttributes', () => {
    it('should run successfully', async () => {
      const mockQualitativeRecord = { method_technique_attribute_qualitative_id: 1 };
      const mockQuantitativeRecord = { method_technique_attribute_quantitative_id: 2 };

      const mockQualitativeResponse = { rows: [mockQualitativeRecord], rowCount: 1 } as any as Promise<
        QueryResult<any>
      >;
      const mockQuantitativeResponse = { rows: [mockQuantitativeRecord], rowCount: 1 } as any as Promise<
        QueryResult<any>
      >;

      const dbConnection = getMockDBConnection({
        sql: sinon
          .stub()
          .onFirstCall()
          .resolves(mockQualitativeResponse)
          .onSecondCall()
          .resolves(mockQuantitativeResponse)
      });

      const repository = new TechniqueAttributeRepository(dbConnection);

      const surveyId = 1;
      const methodTechniqueId = 2;

      const response = await repository.deleteAllTechniqueAttributes(surveyId, methodTechniqueId);

      expect(response).to.eql({
        qualitative_attributes: [mockQualitativeRecord],
        quantitative_attributes: [mockQuantitativeRecord]
      });
    });
  });
});
