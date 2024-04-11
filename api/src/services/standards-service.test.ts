import { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { CritterbaseService } from './critterbase-service';
import { PlatformService } from './platform-service';
import { StandardsService } from './standards-service';

chai.use(sinonChai);

describe('StandardsService', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockUser = { keycloak_guid: 'abc123', username: 'testuser' };

  describe('insertObservationSubCount', () => {
    it('should get species standards', async () => {
      const mockTsn = 123456;
      const mockDbConnection = getMockDBConnection();
      const critterbaseService = new CritterbaseService(mockUser);
      const platformService = new PlatformService(mockDbConnection);
      const standardsService = new StandardsService(mockDbConnection);

      const getTaxonomyByTsnsStub = sinon
        .stub(platformService, 'getTaxonomyByTsns')
        .resolves([{ tsn: String(mockTsn), scientificName: 'caribou' }]);

      const getTaxonBodyLocationsStub = sinon
        .stub(critterbaseService, 'getTaxonBodyLocations')
        .resolves({ marking_body_locations: [{ id: '', key: '', value: 'left ear' }] });

      const getTaxonMeasurementsStub = sinon.stub(critterbaseService, 'getTaxonMeasurements').resolves();

      await standardsService.getSpeciesStandards(mockTsn);

      expect(getTaxonomyByTsnsStub).to.be.calledOnceWith(mockTsn);
      expect(getTaxonBodyLocationsStub).to.be.calledOnceWith(mockTsn);
      expect(getTaxonMeasurementsStub).to.be.calledOnceWith(mockTsn);
    });
  });
});
