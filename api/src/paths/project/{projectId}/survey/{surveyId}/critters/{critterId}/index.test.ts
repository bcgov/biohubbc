import { expect } from 'chai';
import sinon from 'sinon';
import { getSurveyCritter, updateSurveyCritter } from '.';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { CritterAttachmentService } from '../../../../../../../services/critter-attachment-service';
import { CritterbaseService } from '../../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../../services/survey-critter-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';

describe('updateSurveyCritter', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns critters from survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockCBCritter = { critter_id: 'critterbase1' };

    const mockSurveyUpdateCritter = sinon.stub(SurveyCritterService.prototype, 'updateCritter').resolves();
    const mockCritterbaseUpdateCritter = sinon
      .stub(CritterbaseService.prototype, 'updateCritter')
      .resolves(mockCBCritter);
    const mockCritterbaseCreateCritter = sinon
      .stub(CritterbaseService.prototype, 'createCritter')
      .resolves(mockCBCritter);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.body = {
      create: {},
      update: { critter_id: 'critterbase1' }
    };

    const requestHandler = updateSurveyCritter();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDBConnectionStub).to.have.been.calledOnce;
    expect(mockSurveyUpdateCritter).to.have.been.calledOnce;
    expect(mockCritterbaseUpdateCritter).to.have.been.calledOnce;
    expect(mockCritterbaseCreateCritter).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledWith(mockCBCritter);
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');
    const mockSurveyUpdateCritter = sinon.stub(SurveyCritterService.prototype, 'updateCritter').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.body = {
      create: {},
      update: { critter_id: 'critterbase1' }
    };

    const requestHandler = updateSurveyCritter();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockSurveyUpdateCritter).to.have.been.calledOnce;
      expect(getDBConnectionStub).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const errMsg = 'No external critter ID was found.';
    const mockSurveyUpdateCritter = sinon.stub(SurveyCritterService.prototype, 'updateCritter').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.body = {
      update: {}
    };

    const requestHandler = updateSurveyCritter();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(errMsg);
      expect((actualError as HTTPError).status).to.equal(400);
      expect(mockSurveyUpdateCritter).not.to.have.been.called;
      expect(getDBConnectionStub).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });
});

describe('getSurveyCritter', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns a critter from survey', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSimsCritter = {
      survey_id: 2,
      critter_id: 3,
      critterbase_critter_id: '333-333-333'
    };

    const mockAttachments = {
      captureAttachments: [
        {
          critter_capture_attachment_id: 1,
          uuid: '111-111-111',
          critter_id: 3,
          critterbase_capture_id: '222-222-222',
          file_type: 'Other',
          file_name: 'moose_picture.jpg',
          file_size: 100,
          title: 'Moose 1',
          description: 'Picture of a moose',
          key: 'project/1/survey/1/critter/3/attachment/1'
        }
      ]
    };

    const mockCritterbaseCritter = {
      critter_id: '333-333-333'
    };

    const getCritterByIdStub = sinon.stub(SurveyCritterService.prototype, 'getCritterById').resolves(mockSimsCritter);

    const findAllCritterAttachmentsStub = sinon
      .stub(CritterAttachmentService.prototype, 'findAllCritterAttachments')
      .resolves(mockAttachments);

    const getCritterStub = sinon.stub(CritterbaseService.prototype, 'getCritter').resolves(mockCritterbaseCritter);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      critterId: '3 '
    };
    mockReq.query = {
      expand: ['attachments']
    };

    const requestHandler = getSurveyCritter();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getCritterByIdStub).to.have.been.calledOnce;
    expect(findAllCritterAttachmentsStub).to.have.been.calledOnce;
    expect(getCritterStub).to.have.been.calledOnce;

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledWith({
      attachments: { capture_attachments: mockAttachments.captureAttachments },
      ...mockCritterbaseCritter,
      ...mockSimsCritter
    });

    expect(mockDBConnection.commit).to.have.been.called;
    expect(mockDBConnection.release).to.have.been.called;
  });

  it('returns a critter without expanded properties', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSimsCritter = {
      survey_id: 2,
      critter_id: 3,
      critterbase_critter_id: '333-333-333'
    };

    const mockAttachments = {
      captureAttachments: [
        {
          critter_capture_attachment_id: 1,
          uuid: '111-111-111',
          critter_id: 3,
          critterbase_capture_id: '222-222-222',
          file_type: 'Other',
          file_name: 'moose_picture.jpg',
          file_size: 100,
          title: 'Moose 1',
          description: 'Picture of a moose',
          key: 'project/1/survey/1/critter/3/attachment/1'
        }
      ]
    };

    const mockCritterbaseCritter = {
      critter_id: '333-333-333'
    };

    const getCritterByIdStub = sinon.stub(SurveyCritterService.prototype, 'getCritterById').resolves(mockSimsCritter);

    const findAllCritterAttachmentsStub = sinon
      .stub(CritterAttachmentService.prototype, 'findAllCritterAttachments')
      .resolves(mockAttachments);

    const getCritterStub = sinon.stub(CritterbaseService.prototype, 'getCritter').resolves(mockCritterbaseCritter);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      critterId: '3 '
    };

    const requestHandler = getSurveyCritter();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getCritterByIdStub).to.have.been.calledOnce;
    expect(findAllCritterAttachmentsStub).not.to.have.been.called; // attachments not fetched
    expect(getCritterStub).to.have.been.calledOnce;

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledWith({
      ...mockCritterbaseCritter,
      ...mockSimsCritter
    });

    expect(mockDBConnection.commit).to.have.been.called;
    expect(mockDBConnection.release).to.have.been.called;
  });

  it('throws if a sims critter record is not found', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    // Fail to find sims critter record
    const getCritterByIdStub = sinon.stub(SurveyCritterService.prototype, 'getCritterById').resolves(undefined);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      critterId: '3 '
    };
    mockReq.query = {
      expand: ['attachments']
    };

    const requestHandler = getSurveyCritter();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Critter with id 3 not found.');
      expect((actualError as HTTPError).status).to.equal(400);

      expect(getCritterByIdStub).to.have.been.calledOnce;

      expect(mockDBConnection.rollback).to.have.been.called;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });

  it('throws if a critterbase critter record is not found', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSimsCritter = {
      survey_id: 2,
      critter_id: 3,
      critterbase_critter_id: '333-333-333'
    };

    const mockAttachments = {
      captureAttachments: [
        {
          critter_capture_attachment_id: 1,
          uuid: '111-111-111',
          critter_id: 3,
          critterbase_capture_id: '222-222-222',
          file_type: 'Other',
          file_name: 'moose_picture.jpg',
          file_size: 100,
          title: 'Moose 1',
          description: 'Picture of a moose',
          key: 'project/1/survey/1/critter/3/attachment/1'
        }
      ]
    };

    const getCritterByIdStub = sinon.stub(SurveyCritterService.prototype, 'getCritterById').resolves(mockSimsCritter);

    const findAllCritterAttachmentsStub = sinon
      .stub(CritterAttachmentService.prototype, 'findAllCritterAttachments')
      .resolves(mockAttachments);

    // Fail to find external critterbase record
    const getCritterStub = sinon.stub(CritterbaseService.prototype, 'getCritter').resolves(undefined);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      critterId: '3 '
    };
    mockReq.query = {
      expand: ['attachments']
    };

    const requestHandler = getSurveyCritter();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Critterbase critter with id 333-333-333 not found.');
      expect((actualError as HTTPError).status).to.equal(400);

      expect(getCritterByIdStub).to.have.been.calledOnce;
      expect(findAllCritterAttachmentsStub).to.have.been.calledOnce;
      expect(getCritterStub).to.have.been.calledOnce;

      expect(mockDBConnection.rollback).to.have.been.called;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('test error');

    // Fail to find sims critter record
    const getCritterByIdStub = sinon.stub(SurveyCritterService.prototype, 'getCritterById').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      critterId: '3 '
    };
    mockReq.query = {
      expand: ['attachments']
    };

    const requestHandler = getSurveyCritter();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('test error');

      expect(getCritterByIdStub).to.have.been.calledOnce;

      expect(mockDBConnection.rollback).to.have.been.called;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSimsCritter = {
      survey_id: 2,
      critter_id: 3,
      critterbase_critter_id: '333-333-333'
    };

    const mockAttachments = {
      captureAttachments: [
        {
          critter_capture_attachment_id: 1,
          uuid: '111-111-111',
          critter_id: 3,
          critterbase_capture_id: '222-222-222',
          file_type: 'Other',
          file_name: 'moose_picture.jpg',
          file_size: 100,
          title: 'Moose 1',
          description: 'Picture of a moose',
          key: 'project/1/survey/1/critter/3/attachment/1'
        }
      ]
    };

    const mockError = new Error('test error');

    const getCritterByIdStub = sinon.stub(SurveyCritterService.prototype, 'getCritterById').resolves(mockSimsCritter);

    const findAllCritterAttachmentsStub = sinon
      .stub(CritterAttachmentService.prototype, 'findAllCritterAttachments')
      .resolves(mockAttachments);

    // Fail to find external critterbase record
    const getCritterStub = sinon.stub(CritterbaseService.prototype, 'getCritter').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      critterId: '3 '
    };

    const requestHandler = getSurveyCritter();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('test error');

      expect(getCritterByIdStub).to.have.been.calledOnce;
      expect(findAllCritterAttachmentsStub).not.to.have.been.calledOnce;
      expect(getCritterStub).to.have.been.calledOnce;

      expect(mockDBConnection.rollback).to.have.been.called;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });
});
