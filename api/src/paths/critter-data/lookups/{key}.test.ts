import Ajv from 'ajv';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { CritterbaseService } from '../../../services/critterbase-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import * as key from './{key}';

chai.use(sinonChai);

describe('paths/critter-data/lookups/{key}', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema((key.GET.apiDoc as unknown) as object)).to.be.true;
  });

  const mockSelectOptions = [{ key: 'a', value: 'a', id: 'a' }];

  describe('getSelectOptions', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should succeed', async () => {
      const mockGetLookupValues = sinon
        .stub(CritterbaseService.prototype, 'getLookupValues')
        .resolves(mockSelectOptions);
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      const requestHandler = key.getLookupValues();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockGetLookupValues.calledOnce).to.be.true;
      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.json.calledWith(mockSelectOptions)).to.be.true;
    });
    it('should fail', async () => {
      const mockError = new Error('mock error');
      const mockGetLookupValues = sinon.stub(CritterbaseService.prototype, 'getLookupValues').rejects(mockError);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      const requestHandler = key.getLookupValues();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(actualError).to.equal(mockError);
        expect(mockGetLookupValues.calledOnce).to.be.true;
      }
    });
  });
});
