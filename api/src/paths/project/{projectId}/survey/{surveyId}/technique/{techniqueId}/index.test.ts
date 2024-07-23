import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { deleteTechnique, updateTechnique } from '.';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { AttractantService } from '../../../../../../../services/attractants-service';
import { ObservationService } from '../../../../../../../services/observation-service';
import { TechniqueAttributeService } from '../../../../../../../services/technique-attributes-service';
import { TechniqueService } from '../../../../../../../services/technique-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';

chai.use(sinonChai);

describe('deleteTechnique', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      techniqueId: '3'
    };

    const getObservationsCountByTechniqueIdsStub = sinon
      .stub(ObservationService.prototype, 'getObservationsCountByTechniqueIds')
      .resolves(0);

    const deleteTechniqueStub = sinon
      .stub(TechniqueService.prototype, 'deleteTechnique')
      .rejects(new Error('a test error')); // throw error

    const requestHandler = deleteTechnique();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(getObservationsCountByTechniqueIdsStub).to.have.been.calledOnceWith(2, [3]);
      expect(deleteTechniqueStub).to.have.been.calledOnceWith(2, 3);

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });

  it('throws an error if any technique records are associated to an observation record', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      techniqueId: '3'
    };

    const getObservationsCountByTechniqueIdsStub = sinon
      .stub(ObservationService.prototype, 'getObservationsCountByTechniqueIds')
      .resolves(10); // technique records are associated to 10 observation records

    const requestHandler = deleteTechnique();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(getObservationsCountByTechniqueIdsStub).to.have.been.calledOnce;

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal(
        'Cannot delete a technique that is associated with an observation'
      );
      expect((actualError as HTTPError).status).to.equal(409);
    }
  });

  it('deletes a technique record', async () => {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      techniqueId: '3'
    };

    const getObservationsCountByTechniqueIdsStub = sinon
      .stub(ObservationService.prototype, 'getObservationsCountByTechniqueIds')
      .resolves(0);

    const deleteTechniqueStub = sinon.stub(TechniqueService.prototype, 'deleteTechnique').resolves();

    const requestHandler = deleteTechnique();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getObservationsCountByTechniqueIdsStub).to.have.been.calledOnceWith(2, [3]);
    expect(deleteTechniqueStub).to.have.been.calledOnceWith(2, 3);

    expect(mockRes.statusValue).to.eql(200);
  });
});

describe('updateTechnique', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      techniqueId: '3'
    };

    const requestBody = {
      technique: {
        method_technique_id: 444,
        name: 'name',
        description: 'description',
        method_lookup_id: 33,
        distance_threshold: 200,
        attributes: {
          quantitative_attributes: [
            {
              method_technique_attribute_quantitative_id: 44,
              method_lookup_attribute_quantitative_id: 55,
              value: 66
            }
          ],
          qualitative_attributes: [
            {
              method_technique_attribute_qualitative_id: 77,
              method_lookup_attribute_qualitative_id: 88,
              method_lookup_attribute_qualitative_option_id: 99
            }
          ]
        },
        attractants: [
          {
            attractant_lookup_id: 111
          }
        ]
      }
    };

    mockReq.body = requestBody;

    const updateTechniqueStub = sinon
      .stub(TechniqueService.prototype, 'updateTechnique')
      .rejects(new Error('a test error')); // throw error

    const requestHandler = updateTechnique();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(updateTechniqueStub).to.have.been.calledOnceWith(2, {
        method_technique_id: 444,
        name: 'name',
        description: 'description',
        method_lookup_id: 33,
        distance_threshold: 200
      });

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });

  it('updates a technique record', async () => {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      techniqueId: '3'
    };

    const requestBody = {
      technique: {
        method_technique_id: 444,
        name: 'name',
        description: 'description',
        method_lookup_id: 33,
        distance_threshold: 200,
        attributes: {
          quantitative_attributes: [
            {
              method_technique_attribute_quantitative_id: 44,
              method_lookup_attribute_quantitative_id: 55,
              value: 66
            }
          ],
          qualitative_attributes: [
            {
              method_technique_attribute_qualitative_id: 77,
              method_lookup_attribute_qualitative_id: 88,
              method_lookup_attribute_qualitative_option_id: 99
            }
          ]
        },
        attractants: [
          {
            attractant_lookup_id: 111
          }
        ]
      }
    };

    mockReq.body = requestBody;

    const updateTechniqueStub = sinon.stub(TechniqueService.prototype, 'updateTechnique').resolves();

    const updateTechniqueAttractantsStub = sinon
      .stub(AttractantService.prototype, 'updateTechniqueAttractants')
      .resolves();

    const updateQualitativeAttributesForTechniqueStub = sinon
      .stub(TechniqueAttributeService.prototype, 'insertUpdateDeleteQualitativeAttributesForTechnique')
      .resolves();

    const updateQuantitativeAttributesForTechniqueStub = sinon
      .stub(TechniqueAttributeService.prototype, 'insertUpdateDeleteQuantitativeAttributesForTechnique')
      .resolves();

    const requestHandler = updateTechnique();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(updateTechniqueStub).to.have.been.calledOnceWith(2, {
      method_technique_id: 444,
      name: 'name',
      description: 'description',
      method_lookup_id: 33,
      distance_threshold: 200
    });
    expect(updateTechniqueAttractantsStub).to.have.been.calledOnceWith(2, 3, requestBody.technique.attractants);
    expect(updateQualitativeAttributesForTechniqueStub).to.have.been.calledOnceWith(
      2,
      3,
      requestBody.technique.attributes.qualitative_attributes
    );
    expect(updateQuantitativeAttributesForTechniqueStub).to.have.been.calledOnceWith(
      2,
      3,
      requestBody.technique.attributes.quantitative_attributes
    );

    expect(mockRes.statusValue).to.eql(200);
  });
});
