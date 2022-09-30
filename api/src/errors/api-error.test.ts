import { expect } from 'chai';
import { describe } from 'mocha';
import { ApiErrorType, ApiExecuteSQLError, ApiGeneralError, ApiUnknownError } from './api-error';

describe('ApiError', () => {
  describe('No error value provided', () => {
    let message: string;

    before(() => {
      message = 'response message';
    });

    it('Creates Api General error', function () {
      expect(new ApiGeneralError(message).name).to.equal(ApiErrorType.GENERAL);
    });

    it('Creates Api Unknown error', function () {
      expect(new ApiUnknownError(message).name).to.equal(ApiErrorType.UNKNOWN);
    });

    it('Creates Api execute SQL error', function () {
      expect(new ApiExecuteSQLError(message).name).to.equal(ApiErrorType.EXECUTE_SQL);
    });
  });
});
