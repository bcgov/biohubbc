import Ajv from 'ajv';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { CritterbaseService, IBulkCreate } from '../../../services/critterbase-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import * as createCritter from './index';

chai.use(sinonChai);

describe('paths/critter-data/critters/post', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema((createCritter.POST.apiDoc as unknown) as object)).to.be.true;
  });

  const payload: IBulkCreate = {
    critters: [],
    captures: [],
    mortalities: [],
    locations: [],
    markings: [],
    qualitative_measurements: [],
    quantitative_measurements: [],
    families: [],
    collections: []
  };

  describe('createCritter', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should succeed', async () => {
      const mockCreateCritter = sinon.stub(CritterbaseService.prototype, 'createCritter').resolves({ count: 0 });
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.body = payload;
      const requestHandler = createCritter.createCritter();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockCreateCritter).to.have.been.calledOnceWith(payload);
      //expect(mockCreateCritter).calledWith(payload);
      expect(mockRes.statusValue).to.equal(201);
      expect(mockRes.json.calledWith({ count: 0 })).to.be.true;
    });
    it('should fail', async () => {
      const mockError = new Error('mock error');
      const mockCreateCritter = sinon.stub(CritterbaseService.prototype, 'createCritter').rejects(mockError);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.body = payload;
      const requestHandler = createCritter.createCritter();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(actualError).to.equal(mockError);
        expect(mockCreateCritter).to.have.been.calledOnceWith(payload);
      }
    });
  });
});
