import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTP400 } from '../errors/http-error';
import { getMockDBConnection } from '../__mocks__/db';
import { ValidationRepository } from './validation-repository';

chai.use(sinonChai);

describe('ValidationRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getTemplateMethodologySpeciesRecord', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should succeed with valid data', async () => {
      sinon.stub(ValidationRepository.prototype, 'getTemplateNameVersionId').resolves({ template_id: 1 });

      const templateName = 'template Name';
      const templateVersion = '1';
      const surveySpecies = [10];

      const mockResponse = ({
        rows: [
          {
            template_methodology_species_id: 1,
            wldtaxonomic_units_id: '10',
            validation: '{}',
            transform: '{}'
          }
        ]
      } as any) as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({
        knex: async () => mockResponse
      });

      const repo = new ValidationRepository(dbConnection);
      const response = await repo.getTemplateMethodologySpeciesRecord(templateName, templateVersion, surveySpecies);
      expect(response.template_methodology_species_id).to.be.eql(1);
      expect(response.validation).to.be.eql('{}');
      expect(response.transform).to.be.eql('{}');
    });

    it('should throw an error', async () => {
      sinon.stub(ValidationRepository.prototype, 'getTemplateNameVersionId').resolves({ template_id: 1 });

      const mockResponse = ({} as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        knex: async () => mockResponse
      });

      const repo = new ValidationRepository(dbConnection);

      try {
        await repo.getTemplateMethodologySpeciesRecord('name', 'version', [1]);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to query template methodology species table');
      }
    });
  });

  describe('getTemplateMethodologySpeciesRecord', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error', async () => {
      const mockResponse = (null as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => mockResponse
      });

      const repo = new ValidationRepository(dbConnection);

      try {
        await repo.getTemplateNameVersionId('name', 'version');
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to query template table');
      }
    });

    it('should succeed with valid data', async () => {
      const mockResponse = ({ rows: [{ template_id: 1 }] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => mockResponse
      });

      const repo = new ValidationRepository(dbConnection);

      const response = await repo.getTemplateNameVersionId('name', 'version');
      expect(response.template_id).to.be.eql(1);
    });
  });
});
