import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getSurveyObservedSpecies } from '.';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { ObservationService } from '../../../../../../../services/observation-service';
import { PlatformService } from '../../../../../../../services/platform-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';

chai.use(sinonChai);

describe('getSurveyObservedSpecies', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets species observed in a survey', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockSurveyId = 2;
    const mockProjectId = 1;
    const mockTsns = [1, 2, 3];
    const mockSpecies = mockTsns.map((tsn) => ({ itis_tsn: tsn }));
    const mockItisResponse = [
      { tsn: '1', commonNames: ['common name 1'], scientificName: 'scientific name 1' },
      { tsn: '2', commonNames: ['common name 2'], scientificName: 'scientific name 2' },
      { tsn: '3', commonNames: ['common name 3'], scientificName: 'scientific name 3' }
    ];
    const mockFormattedItisResponse = mockItisResponse.map((species) => ({ ...species, tsn: Number(species.tsn) }));

    const getObservedSpeciesForSurveyStub = sinon
      .stub(ObservationService.prototype, 'getObservedSpeciesForSurvey')
      .resolves(mockSpecies);

    const getTaxonomyByTsnsStub = sinon.stub(PlatformService.prototype, 'getTaxonomyByTsns').resolves(mockItisResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: String(mockProjectId),
      surveyId: String(mockSurveyId)
    };

    const requestHandler = getSurveyObservedSpecies();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getObservedSpeciesForSurveyStub).to.have.been.calledOnceWith(mockSurveyId);
    expect(getTaxonomyByTsnsStub).to.have.been.calledOnceWith(mockTsns);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.jsonValue).to.eql(mockFormattedItisResponse);
  });

  it('catches and re-throws error', async () => {
    const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockSurveyId = 2;
    const mockProjectId = 1;

    sinon.stub(ObservationService.prototype, 'getObservedSpeciesForSurvey').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: String(mockProjectId),
      surveyId: String(mockSurveyId)
    };

    try {
      const requestHandler = getSurveyObservedSpecies();

      await requestHandler(mockReq, mockRes, mockNext);

      expect.fail();
    } catch (actualError) {
      expect(dbConnectionObj.release).to.have.been.called;
      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
