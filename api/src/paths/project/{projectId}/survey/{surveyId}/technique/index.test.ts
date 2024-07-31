import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { createTechniques, getTechniques } from '.';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { TechniqueObject } from '../../../../../../repositories/technique-repository';
import { TechniqueService } from '../../../../../../services/technique-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';

chai.use(sinonChai);

describe('createTechniques', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '1'
    };

    mockReq.body = {
      techniques: [
        {
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
      ]
    };

    const insertTechniquesForSurveyStub = sinon
      .stub(TechniqueService.prototype, 'insertTechniquesForSurvey')
      .rejects(new Error('a test error'));

    const requestHandler = createTechniques();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(insertTechniquesForSurveyStub).to.have.been.calledOnceWith(1, mockReq.body.techniques);

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });

  it('creates a new technique record', async () => {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '1'
    };

    mockReq.body = {
      techniques: [
        {
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
      ]
    };

    const insertTechniquesForSurveyStub = sinon
      .stub(TechniqueService.prototype, 'insertTechniquesForSurvey')
      .resolves([{ method_technique_id: 11 }]);

    const requestHandler = createTechniques();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(insertTechniquesForSurveyStub).to.have.been.calledOnceWith(1, mockReq.body.techniques);
  });
});

describe('getTechniques', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '1'
    };

    const techniqueRecord: TechniqueObject = {
      method_technique_id: 11,
      name: 'name',
      description: 'description',
      distance_threshold: 200,
      method_lookup_id: 33,
      attractants: [
        {
          attractant_lookup_id: 111
        }
      ],
      attributes: {
        quantitative_attributes: [
          {
            method_technique_attribute_quantitative_id: 44,
            method_lookup_attribute_quantitative_id: '123-456-55',
            value: 66
          }
        ],
        qualitative_attributes: [
          {
            method_technique_attribute_qualitative_id: 77,
            method_lookup_attribute_qualitative_id: '123-456-88',
            method_lookup_attribute_qualitative_option_id: '123-456-99'
          }
        ]
      }
    };

    const getTechniquesForSurveyIdStub = sinon
      .stub(TechniqueService.prototype, 'getTechniquesForSurveyId')
      .resolves([techniqueRecord]);

    const getTechniquesCountForSurveyIdStub = sinon
      .stub(TechniqueService.prototype, 'getTechniquesCountForSurveyId')
      .rejects(new Error('a test error'));

    const requestHandler = getTechniques();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(getTechniquesForSurveyIdStub).to.have.been.calledOnceWith(1, undefined);
      expect(getTechniquesCountForSurveyIdStub).to.have.been.calledOnceWith(1);

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });

  it('returns technique records', async () => {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '1'
    };

    const techniqueRecord: TechniqueObject = {
      method_technique_id: 11,
      name: 'name',
      description: 'description',
      distance_threshold: 200,
      method_lookup_id: 33,
      attractants: [
        {
          attractant_lookup_id: 111
        }
      ],
      attributes: {
        quantitative_attributes: [
          {
            method_technique_attribute_quantitative_id: 44,
            method_lookup_attribute_quantitative_id: '123-456-55',
            value: 66
          }
        ],
        qualitative_attributes: [
          {
            method_technique_attribute_qualitative_id: 77,
            method_lookup_attribute_qualitative_id: '123-456-88',
            method_lookup_attribute_qualitative_option_id: '123-456-99'
          }
        ]
      }
    };

    const getTechniquesForSurveyIdStub = sinon
      .stub(TechniqueService.prototype, 'getTechniquesForSurveyId')
      .resolves([techniqueRecord]);

    const getTechniquesCountForSurveyIdStub = sinon
      .stub(TechniqueService.prototype, 'getTechniquesCountForSurveyId')
      .resolves(1);

    const requestHandler = getTechniques();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getTechniquesForSurveyIdStub).to.have.been.calledOnceWith(1, undefined);
    expect(getTechniquesCountForSurveyIdStub).to.have.been.calledOnceWith(1);

    expect(mockRes.jsonValue).to.eql({
      techniques: [techniqueRecord],
      count: 1,
      pagination: {
        total: 1,
        per_page: 1,
        current_page: 1,
        last_page: 1,
        sort: undefined,
        order: undefined
      }
    });
    expect(mockRes.statusValue).to.eql(200);
  });
});
