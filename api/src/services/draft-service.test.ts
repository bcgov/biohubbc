import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiError } from '../errors/api-error';
import { PostPutDraftObject } from '../models/draft-create';
import { DraftRepository, WebformDraft } from '../repositories/draft-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { DraftService } from './draft-service';

chai.use(sinonChai);

describe('DraftService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('deleteDraft', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new DraftService(dbConnection);

      const data = {
        draftId: 1
      };

      const repoStub = sinon.stub(DraftRepository.prototype, 'deleteDraft').resolves();

      const response = await service.deleteDraft(data.draftId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });

    it('fails with invalid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new DraftService(dbConnection);

      const data = {
        draftId: 1
      };

      const expectedError = new Error('service function failed');

      const repoStub = sinon.stub(DraftRepository.prototype, 'deleteDraft').rejects(expectedError);
      try {
        await service.deleteDraft(data.draftId);
        expect.fail();
      } catch (actualError) {
        expect(repoStub).to.be.calledOnce;
        expect((actualError as ApiError).message).to.equal(expectedError.message);
      }
    });
  });

  describe('getDraft', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new DraftService(dbConnection);

      const data = {
        draftId: 1
      };

      const repoStub = sinon
        .stub(DraftService.prototype, 'getDraft')
        .resolves(({ name: 'test' } as unknown) as WebformDraft);

      const response = await service.getDraft(data.draftId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({ name: 'test' });
    });

    it('fails with invalid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new DraftService(dbConnection);

      const data = {
        draftId: 1
      };

      const expectedError = new Error('service function failed');

      const repoStub = sinon.stub(DraftRepository.prototype, 'getDraft').rejects(expectedError);
      try {
        await service.getDraft(data.draftId);
        expect.fail();
      } catch (actualError) {
        expect(repoStub).to.be.calledOnce;
        expect((actualError as ApiError).message).to.equal(expectedError.message);
      }
    });
  });

  describe('getDraftList', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new DraftService(dbConnection);

      const data = {
        systemUserId: 1
      };

      const repoStub = sinon
        .stub(DraftService.prototype, 'getDraftList')
        .resolves(([{ name: 'test' } as unknown] as unknown) as WebformDraft[]);

      const response = await service.getDraftList(data.systemUserId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([{ name: 'test' }]);
    });

    it('fails with invalid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new DraftService(dbConnection);

      const data = {
        systemUserId: 1
      };

      const expectedError = new Error('service function failed');

      const repoStub = sinon.stub(DraftRepository.prototype, 'getDraftList').rejects(expectedError);
      try {
        await service.getDraftList(data.systemUserId);
        expect.fail();
      } catch (actualError) {
        expect(repoStub).to.be.calledOnce;
        expect((actualError as ApiError).message).to.equal(expectedError.message);
      }
    });
  });

  describe('createDraft', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new DraftService(dbConnection);

      const data = {
        systemUserId: 1,
        name: 'test',
        webformJson: 'test'
      };

      const repoStub = sinon.stub(DraftRepository.prototype, 'createDraft').resolves();

      const response = await service.createDraft(data.systemUserId, ({
        name: data.name,
        data: data
      } as unknown) as PostPutDraftObject);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });

    it('fails with invalid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new DraftService(dbConnection);

      const data = {
        systemUserId: 1,
        name: 'test',
        webformJson: 'test'
      };

      const expectedError = new Error('service function failed');

      const repoStub = sinon.stub(DraftRepository.prototype, 'createDraft').rejects(expectedError);
      try {
        await service.createDraft(data.systemUserId, ({
          name: data.name,
          data: data
        } as unknown) as PostPutDraftObject);

        expect.fail();
      } catch (actualError) {
        expect(repoStub).to.be.calledOnce;
        expect((actualError as ApiError).message).to.equal(expectedError.message);
      }
    });
  });

  describe('updateDraft', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new DraftService(dbConnection);

      const data = {
        draftId: 1,
        name: 'test',
        webformJson: 'test'
      };

      const repoStub = sinon.stub(DraftRepository.prototype, 'updateDraft').resolves();

      const response = await service.updateDraft(data.draftId, ({
        name: data.name,
        data: data
      } as unknown) as PostPutDraftObject);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });

    it('fails with invalid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new DraftService(dbConnection);

      const data = {
        draftId: 1,
        name: 'test',
        webformJson: 'test'
      };

      const expectedError = new Error('service function failed');

      const repoStub = sinon.stub(DraftRepository.prototype, 'updateDraft').rejects(expectedError);
      try {
        await service.updateDraft(data.draftId, ({
          name: data.name,
          data: data
        } as unknown) as PostPutDraftObject);

        expect.fail();
      } catch (actualError) {
        expect(repoStub).to.be.calledOnce;
        expect((actualError as ApiError).message).to.equal(expectedError.message);
      }
    });
  });
});
