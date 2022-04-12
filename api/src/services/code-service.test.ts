import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
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

      const mockDBConnection = getMockDBConnection({ query: mockQuery });

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.getAllCodeSets();

      expect(response).to.have.all.keys(
        'management_action_type',
        'first_nations',
        'funding_source',
        'investment_action_category',
        'activity',
        'project_type',
        'coordinator_agency',
        'region',
        'species',
        'proprietor_type',
        'iucn_conservation_action_level_1_classification',
        'iucn_conservation_action_level_2_subclassification',
        'iucn_conservation_action_level_3_subclassification',
        'system_roles',
        'project_roles',
        'regional_offices',
        'administrative_activity_status_type',
        'ecological_seasons',
        'field_methods',
        'intended_outcomes',
        'vantage_codes'
      );
    });
  });
});
