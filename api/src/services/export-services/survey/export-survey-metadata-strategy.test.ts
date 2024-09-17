import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../__mocks__/db';
import { ExportSurveyMetadataStrategy } from './export-survey-metadata-strategy';

chai.use(sinonChai);

describe('ExportSurveyMetadataStrategy', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getExportStrategyConfig', () => {
    it('should return the export strategy config', async () => {
      const connection = getMockDBConnection();

      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      const exportSurveyMetadataStrategy = new ExportSurveyMetadataStrategy(config, connection);

      const result = await exportSurveyMetadataStrategy.getExportStrategyConfig();

      expect(result.queries?.length).to.equal(1);
      expect(result.queries?.[0].fileName).to.equal('survey_metadata.json');
    });
  });
});
