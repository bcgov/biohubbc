import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { CodeRepository } from '../repositories/code-repository';
import { CodeService } from './code-service';

chai.use(sinonChai);

describe('CodeService', () => {
  describe('getAllCodeSets', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns all code sets', async function () {
      const mockQuery = sinon.stub();
      mockQuery.resolves({
        rows: [{ id: 1, name: 'codeName' }]
      });

      const mockDBConnection = getMockDBConnection({ sql: mockQuery });

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.getAllCodeSets();

      expect(response).to.have.all.keys(
        'management_action_type',
        'first_nations',
        'agency',
        'attractants',
        'investment_action_category',
        'survey_data_type',
        'proprietor_type',
        'iucn_conservation_action_level_1_classification',
        'iucn_conservation_action_level_2_subclassification',
        'iucn_conservation_action_level_3_subclassification',
        'system_roles',
        'project_roles',
        'administrative_activity_status_type',
        'intended_outcomes',
        'site_selection_strategies',
        'survey_jobs',
        'sample_methods',
        'survey_progress',
        'method_response_metrics',
        'observation_signs',
        'telemetry_device_makes',
        'frequency_units',
        'alert_types',
        'vantages',
        'habitat_feature_types'
      );
    });
  });

  describe('getAllCodesetCategories', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns transformed codeset categories', async function () {
      const mockRawCategories = [
        {
          name: 'observation_sign',
          description: 'Signs of species observation',
          codes: [
            { id: 1, name: 'Tracks', description: 'Animal tracks' },
            { id: 2, name: 'Scat', description: 'Animal droppings' }
          ]
        },
        {
          name: 'device_make',
          description: 'Telemetry device manufacturers',
          codes: [{ id: 5, name: 'Lotek', description: null }]
        }
      ];

      const mockDBConnection = getMockDBConnection();

      sinon.stub(CodeRepository.prototype, 'getAllCodesetCategories').resolves(mockRawCategories);

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.getAllCodesetCategories();

      expect(response).to.have.length(2);

      // Verify first category (key, label, description; codes with key, label, external_id)
      expect(response[0].key).to.equal('observation_sign');
      expect(response[0].label).to.equal('Observation Sign');
      expect(response[0].description).to.equal('Signs of species observation');
      expect(response[0].codes).to.have.length(2);
      expect(response[0].codes[0].key).to.equal('1');
      expect(response[0].codes[0].label).to.equal('Tracks');
      expect(response[0].codes[0].external_id).to.equal('1');
      expect(response[0].codes[1].key).to.equal('2');
      expect(response[0].codes[1].external_id).to.equal('2');

      // Verify second category
      expect(response[1].key).to.equal('device_make');
      expect(response[1].codes[0].key).to.equal('5');
      expect(response[1].codes[0].label).to.equal('Lotek');
      expect(response[1].codes[0].external_id).to.equal('5');
      expect(response[1].codes[0].description).to.be.null;
    });

    it('sets external_id to string when code id is string (e.g. UUID)', async function () {
      const mockRawCategories = [
        {
          name: 'environment_qualitative',
          description: 'Qualitative environmental variables',
          codes: [
            {
              id: '323e4567-e89b-12d3-a456-426614174001',
              name: 'Temperature Category',
              description: 'Temperature ranges'
            }
          ]
        }
      ];

      const mockDBConnection = getMockDBConnection();

      sinon.stub(CodeRepository.prototype, 'getAllCodesetCategories').resolves(mockRawCategories);

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.getAllCodesetCategories();

      expect(response).to.have.length(1);
      expect(response[0].key).to.equal('environment_qualitative');
      expect(response[0].codes[0].key).to.equal('323e4567-e89b-12d3-a456-426614174001');
      expect(response[0].codes[0].external_id).to.equal('323e4567-e89b-12d3-a456-426614174001');
    });

    it('returns empty array when no categories are found', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(CodeRepository.prototype, 'getAllCodesetCategories').resolves([]);

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.getAllCodesetCategories();

      expect(response).to.be.an('array').that.is.empty;
    });

    it('handles categories with empty codes array', async function () {
      const mockRawCategories = [
        {
          name: 'empty_category',
          description: 'A category with no codes',
          codes: []
        }
      ];

      const mockDBConnection = getMockDBConnection();

      sinon.stub(CodeRepository.prototype, 'getAllCodesetCategories').resolves(mockRawCategories);

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.getAllCodesetCategories();

      expect(response).to.have.length(1);
      expect(response[0].key).to.equal('empty_category');
      expect(response[0].codes).to.be.an('array').that.is.empty;
    });
  });
});
