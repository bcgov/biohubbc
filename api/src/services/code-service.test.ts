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

      const mockDBConnection = getMockDBConnection({ sql: mockQuery });

      const codeService = new CodeService(mockDBConnection);

      const response = await codeService.getAllCodeSets();

      expect(response).to.have.all.keys(
        'management_action_type',
        'first_nations',
        'agency',
        'investment_action_category',
        'type',
        'program',
        'proprietor_type',
        'iucn_conservation_action_level_1_classification',
        'iucn_conservation_action_level_2_subclassification',
        'iucn_conservation_action_level_3_subclassification',
        'system_roles',
        'project_roles',
        'administrative_activity_status_type',
        'intended_outcomes',
        'vantage_codes',
        'site_selection_strategies',
        'survey_jobs',
        'sample_methods',
        'survey_progress',
        'method_response_metrics'
      );
    });
  });
});
