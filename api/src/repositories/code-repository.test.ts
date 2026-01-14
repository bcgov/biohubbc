import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { CodeRepository } from './code-repository';

chai.use(sinonChai);

describe('CodeRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getAllCodesetCategories', () => {
    it('returns all 35 codetable categories', async () => {
      // Mock response for each codetable query
      const mockCodeResponse = {
        rows: [
          { id: 1, name: 'Test Code', description: 'Test description' },
          { id: 2, name: 'Another Code', description: null }
        ],
        rowCount: 2
      } as QueryResult<any>;

      const mockKnex = sinon.stub().resolves(mockCodeResponse);

      const dbConnectionObj = getMockDBConnection({ knex: mockKnex });

      const repo = new CodeRepository(dbConnectionObj);

      const response = await repo.getAllCodesetCategories();

      // Should have all 35 categories
      expect(response).to.have.length(35);

      // Verify knex was called 35 times (once per codetable)
      expect(mockKnex.callCount).to.equal(35);

      // Verify expected category names are present
      const categoryNames = response.map((cat) => cat.name);
      expect(categoryNames).to.include('agency');
      expect(categoryNames).to.include('observation_sign');
      expect(categoryNames).to.include('device_make');
      expect(categoryNames).to.include('environment_qualitative');
      expect(categoryNames).to.include('method_lookup');
      expect(categoryNames).to.include('vantage_category');
    });

    it('returns categories with correct structure', async () => {
      const mockCodeResponse = {
        rows: [
          { id: 5, name: 'Test Code', description: 'A test description' },
          { id: 10, name: 'Second Code', description: null }
        ],
        rowCount: 2
      } as QueryResult<any>;

      const mockKnex = sinon.stub().resolves(mockCodeResponse);

      const dbConnectionObj = getMockDBConnection({ knex: mockKnex });

      const repo = new CodeRepository(dbConnectionObj);

      const response = await repo.getAllCodesetCategories();

      // Verify structure of first category
      const firstCategory = response[0];
      expect(firstCategory).to.have.property('name');
      expect(firstCategory).to.have.property('description');
      expect(firstCategory).to.have.property('codes');
      expect(firstCategory.codes).to.be.an('array');

      // Verify codes have correct structure
      expect(firstCategory.codes[0]).to.have.property('id');
      expect(firstCategory.codes[0]).to.have.property('name');
      expect(firstCategory.codes[0]).to.have.property('description');
    });

    it('handles numeric IDs correctly', async () => {
      const mockCodeResponse = {
        rows: [{ id: 42, name: 'Numeric ID Code', description: 'Test' }],
        rowCount: 1
      } as QueryResult<any>;

      const mockKnex = sinon.stub().resolves(mockCodeResponse);

      const dbConnectionObj = getMockDBConnection({ knex: mockKnex });

      const repo = new CodeRepository(dbConnectionObj);

      const response = await repo.getAllCodesetCategories();

      // Verify numeric ID is returned as-is
      expect(response[0].codes[0].id).to.equal(42);
      expect(typeof response[0].codes[0].id).to.equal('number');
    });

    it('handles UUID string IDs correctly (for environment tables)', async () => {
      const mockCodeResponse = {
        rows: [{ id: '323e4567-e89b-12d3-a456-426614174001', name: 'UUID Code', description: 'Test' }],
        rowCount: 1
      } as QueryResult<any>;

      const mockKnex = sinon.stub().resolves(mockCodeResponse);

      const dbConnectionObj = getMockDBConnection({ knex: mockKnex });

      const repo = new CodeRepository(dbConnectionObj);

      const response = await repo.getAllCodesetCategories();

      // Verify UUID string ID is returned as-is
      expect(response[0].codes[0].id).to.equal('323e4567-e89b-12d3-a456-426614174001');
      expect(typeof response[0].codes[0].id).to.equal('string');
    });

    it('handles empty codetables correctly', async () => {
      const mockEmptyResponse = {
        rows: [],
        rowCount: 0
      } as any as QueryResult<any>;

      const mockKnex = sinon.stub().resolves(mockEmptyResponse);

      const dbConnectionObj = getMockDBConnection({ knex: mockKnex });

      const repo = new CodeRepository(dbConnectionObj);

      const response = await repo.getAllCodesetCategories();

      // All categories should exist but with empty codes arrays
      expect(response).to.have.length(35);
      response.forEach((category) => {
        expect(category.codes).to.be.an('array').that.is.empty;
      });
    });

    it('includes method_lookup which has no record_end_date filter', async () => {
      const mockCodeResponse = {
        rows: [{ id: 1, name: 'Quadrat', description: 'Sampling method' }],
        rowCount: 1
      } as QueryResult<any>;

      const mockKnex = sinon.stub().resolves(mockCodeResponse);

      const dbConnectionObj = getMockDBConnection({ knex: mockKnex });

      const repo = new CodeRepository(dbConnectionObj);

      const response = await repo.getAllCodesetCategories();

      // Verify method_lookup is included
      const methodLookup = response.find((cat) => cat.name === 'method_lookup');
      expect(methodLookup).to.not.be.undefined;
      expect(methodLookup?.description).to.equal('Survey methods and techniques');
    });

    it('all categories have non-null descriptions', async () => {
      const mockCodeResponse = {
        rows: [],
        rowCount: 0
      } as any as QueryResult<any>;

      const mockKnex = sinon.stub().resolves(mockCodeResponse);

      const dbConnectionObj = getMockDBConnection({ knex: mockKnex });

      const repo = new CodeRepository(dbConnectionObj);

      const response = await repo.getAllCodesetCategories();

      // All category descriptions should be defined (not undefined)
      response.forEach((category) => {
        expect(category.description).to.be.a('string');
        expect(category.description!.length).to.be.greaterThan(0);
      });
    });
  });

  describe('_buildCodetableQuery', () => {
    it('builds query with record_end_date filter when hasRecordEndDate is true', () => {
      const dbConnectionObj = getMockDBConnection();
      const repo = new CodeRepository(dbConnectionObj);

      const query = repo._buildCodetableQuery('observation_sign', true);
      const sql = query.toString();

      expect(sql).to.include('observation_sign');
      expect(sql).to.include('"record_end_date" is null');
      expect(sql).to.include('order by');
    });

    it('builds query without record_end_date filter when hasRecordEndDate is false', () => {
      const dbConnectionObj = getMockDBConnection();
      const repo = new CodeRepository(dbConnectionObj);

      const query = repo._buildCodetableQuery('method_lookup', false);
      const sql = query.toString();

      expect(sql).to.include('method_lookup');
      expect(sql).to.not.include('record_end_date');
      expect(sql).to.include('order by');
    });

    it('generates correct column alias for id', () => {
      const dbConnectionObj = getMockDBConnection();
      const repo = new CodeRepository(dbConnectionObj);

      const query = repo._buildCodetableQuery('device_make', true);
      const sql = query.toString();

      // Should select device_make_id AS id
      expect(sql).to.include('device_make_id');
    });
  });
});
