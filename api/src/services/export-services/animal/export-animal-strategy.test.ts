import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../__mocks__/db';
import { ExportAnimalStrategy } from './export-animal-strategy';

chai.use(sinonChai);

describe('ExportObservationStrategy', () => {
  describe('getExportStrategyConfig', () => {
    it('should return the export strategy config', async () => {
      const connection = getMockDBConnection();

      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      const exportAnimalStrategy = new ExportAnimalStrategy(config, connection);
      const getCollectionCategoriesListStub = sinon
        .stub(exportAnimalStrategy, '_getCollectionCategoriesList')
        .resolves(['Category1', 'Category2']);

      const result = await exportAnimalStrategy.getExportStrategyConfig();

      expect(getCollectionCategoriesListStub.calledOnce).to.be.true;
      expect(result.streams?.[0].collectionCategories).to.include.members(['Category1', 'Category2']);
      expect(result.streams?.length).to.equal(4);
      expect(result.streams?.[0].fileName).to.equal('animal.csv');
      expect(result.streams?.[1].fileName).to.equal('captures.csv');
      expect(result.streams?.[2].fileName).to.equal('mortalities.csv');
      expect(result.streams?.[3].fileName).to.equal('markings.csv');
    });
  });
});
