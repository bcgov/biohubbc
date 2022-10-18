import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTP400 } from '../errors/http-error';
import { queries } from '../queries/queries';
import { getMockDBConnection } from '../__mocks__/db';
import { ValidationRepository } from './validation-repository';

chai.use(sinonChai);

describe('ValidationRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getTemplateMethodologySpeciesRecord', () => {
    it('should succeed with valid data', async () => {
      const templateId = 1;
      const fieldMethodId = 10;

      const mockResponse = ({
        rows: [
          {
            field_method_id: fieldMethodId,
            template_id: templateId,
            validation: {},
            transform: {}
          }
        ]
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });
      const repo = new ValidationRepository(dbConnection);
      const response = await repo.getTemplateMethodologySpeciesRecord(fieldMethodId, templateId);
      expect(response.field_method_id).to.be.eql(fieldMethodId);
      expect(response.template_id).to.be.eql(templateId);
    });

    it('should throw `Failed to build SQL` error', async () => {
      const mockQuery = sinon.stub(queries.survey, 'getTemplateMethodologySpeciesRecordSQL').returns(null);
      const dbConnection = getMockDBConnection();
      const repo = new ValidationRepository(dbConnection);

      try {
        await repo.getTemplateMethodologySpeciesRecord(1, 1);
        expect(mockQuery).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql(
          'Failed to build SQL get template methodology species record sql statement'
        );
      }
    });

    it('should throw `Failed to query template` error', async () => {
      const mockResponse = (null as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: async () => {
          return mockResponse;
        }
      });
      const repo = new ValidationRepository(dbConnection);
      try {
        await repo.getTemplateMethodologySpeciesRecord(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.equal('Failed to query template methodology species table');
      }
    });
  });

  it('should succeed with valid data', async () => {
    const templateId = 1;
    const fieldMethodId = 10;

    const mockResponse = ({
      rows: []
    } as any) as Promise<QueryResult<any>>;
    const dbConnection = getMockDBConnection({
      query: () => mockResponse
    });
    const repo = new ValidationRepository(dbConnection);
    const response = await repo.getTemplateMethodologySpeciesRecord(fieldMethodId, templateId);
    expect(response).to.be.eql(null);
  });
});
