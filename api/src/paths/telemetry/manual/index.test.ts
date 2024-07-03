import Ajv from 'ajv';
import { expect } from 'chai';
import sinon from 'sinon';
import { createManualTelemetry, GET, getManualTelemetry, PATCH, POST, updateManualTelemetry } from '.';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { IManualTelemetry } from '../../../models/bctw';
import { BctwTelemetryService } from '../../../services/bctw-service/bctw-telemetry-service';

const mockTelemetry = [
  {
    telemetry_manual_id: 1
  },
  {
    telemetry_manual_id: 2
  }
] as unknown[] as IManualTelemetry[];

describe('manual telemetry endpoints', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getManualTelemetry', () => {
    describe('openapi schema', () => {
      it('is valid openapi v3 schema', () => {
        const ajv = new Ajv();
        expect(ajv.validateSchema(GET.apiDoc as unknown as object)).to.be.true;
      });
    });
    it('should retrieve all manual telemetry', async () => {
      const mockGetTelemetry = sinon.stub(BctwTelemetryService.prototype, 'getManualTelemetry').resolves(mockTelemetry);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      const requestHandler = getManualTelemetry();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql(mockTelemetry);
      expect(mockRes.statusValue).to.equal(200);
      expect(mockGetTelemetry).to.have.been.calledOnce;
    });

    it('should catch error', async () => {
      const mockError = new Error('test error');
      const mockGetTelemetry = sinon.stub(BctwTelemetryService.prototype, 'getManualTelemetry').rejects(mockError);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      const requestHandler = getManualTelemetry();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
      } catch (err) {
        expect(err).to.equal(mockError);
        expect(mockGetTelemetry).to.have.been.calledOnce;
      }
    });
  });

  describe('createManualTelemetry', () => {
    describe('openapi schema', () => {
      it('is valid openapi v3 schema', () => {
        const ajv = new Ajv();
        expect(ajv.validateSchema(POST.apiDoc as unknown as object)).to.be.true;
      });
    });
    it('should bulk create manual telemetry', async () => {
      const mockCreateTelemetry = sinon.stub(BctwTelemetryService.prototype, 'createManualTelemetry').resolves(mockTelemetry);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      const requestHandler = createManualTelemetry();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql(mockTelemetry);
      expect(mockRes.statusValue).to.equal(201);
      expect(mockCreateTelemetry).to.have.been.calledOnce;
    });
    it('should catch error', async () => {
      const mockError = new Error('test error');
      const mockGetTelemetry = sinon.stub(BctwTelemetryService.prototype, 'createManualTelemetry').rejects(mockError);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      const requestHandler = createManualTelemetry();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
      } catch (err) {
        expect(err).to.equal(mockError);
        expect(mockGetTelemetry).to.have.been.calledOnce;
      }
    });
  });

  describe('updateManualTelemetry', () => {
    describe('openapi schema', () => {
      it('is valid openapi v3 schema', () => {
        const ajv = new Ajv();
        expect(ajv.validateSchema(PATCH.apiDoc as unknown as object)).to.be.true;
      });
    });
    it('should bulk update manual telemetry', async () => {
      const mockCreateTelemetry = sinon.stub(BctwTelemetryService.prototype, 'updateManualTelemetry').resolves(mockTelemetry);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      const requestHandler = updateManualTelemetry();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql(mockTelemetry);
      expect(mockRes.statusValue).to.equal(201);
      expect(mockCreateTelemetry).to.have.been.calledOnce;
    });
    it('should catch error', async () => {
      const mockError = new Error('test error');
      const mockGetTelemetry = sinon.stub(BctwTelemetryService.prototype, 'updateManualTelemetry').rejects(mockError);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      const requestHandler = updateManualTelemetry();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
      } catch (err) {
        expect(err).to.equal(mockError);
        expect(mockGetTelemetry).to.have.been.calledOnce;
      }
    });
  });
});
