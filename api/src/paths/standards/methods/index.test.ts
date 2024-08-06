import chai, { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMethodStandards } from '.';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/http-error';
import { StandardsService } from '../../../services/standards-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';

chai.use(sinonChai);

describe('standards/environment', () => {
  describe('getMethodStandards', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should retrieve environment standards successfully', async () => {
      const mockResponse = [
        {
          method_lookup_id: 1,
          name: 'Name',
          description: 'Description',
          attributes: {
            quantitative: [
              { name: 'Quantitative Standard 1', description: 'Description 1', unit: 'Unit' },
              { name: 'Quantitative Standard 2', description: 'Description 2', unit: 'Unit' }
            ],
            qualitative: [
              {
                name: 'Qualitative Standard 1',
                description: 'Description 1',
                options: [
                  { name: 'Option 1', description: 'Option 1 Description' },
                  { name: 'Option 2', description: 'Option 2 Description' }
                ]
              },
              {
                name: 'Qualitative Standard 2',
                description: 'Description 2',
                options: [
                  { name: 'Option 3', description: 'Option 3 Description' },
                  { name: 'Option 4', description: 'Option 4 Description' }
                ]
              }
            ]
          }
        }
      ];

      const mockDBConnection = getMockDBConnection();

      sinon.stub(db, 'getAPIUserDBConnection').returns(mockDBConnection);

      sinon.stub(StandardsService.prototype, 'getMethodStandards').resolves(mockResponse);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = getMethodStandards();

        await requestHandler(mockReq, mockRes, mockNext);
      } catch (actualError) {
        expect.fail();
      }

      expect(mockRes.status).to.have.been.calledWith(200);
      expect(mockRes.json).to.have.been.calledWith(mockResponse);
    });

    it('catches and re-throws error', async () => {
      const mockDBConnection = getMockDBConnection({
        open: sinon.stub(),
        commit: sinon.stub(),
        rollback: sinon.stub(),
        release: sinon.stub()
      });

      sinon.stub(db, 'getAPIUserDBConnection').returns(mockDBConnection);

      sinon
        .stub(StandardsService.prototype, 'getMethodStandards')
        .rejects(new Error('Failed to retrieve environment standards'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = getMethodStandards();
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(mockDBConnection.open).to.have.been.calledOnce;
        expect(mockDBConnection.rollback).to.have.been.calledOnce;
        expect(mockDBConnection.release).to.have.been.calledOnce;
        expect((actualError as HTTPError).message).to.equal('Failed to retrieve environment standards');
      }
    });
  });
});
