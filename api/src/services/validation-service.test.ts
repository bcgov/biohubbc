import { GetObjectOutput } from 'aws-sdk/clients/s3';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../database/db';
import { getMockDBConnection } from '../__mocks__/db';
import { ValidationService } from './validation-service';


chai.use(sinonChai);

const dbConnection = getMockDBConnection({
  systemUserId: () => {
    return 20;
  }
});

const sampleReq = {
  keycloak_token: {},
  body: {
    occurrence_submission_id: 1
  }
} as any;

describe('ValidationService', () => {
  afterEach(() => {
    sinon.restore();
  });

  // it('', async () => {
  //   const dbConnection = getMockDBConnection();
  //   const service = new ValidationService(dbConnection);
  // });

  it('', async () => {
    const dbConnection = getMockDBConnection();
    const service = new ValidationService(dbConnection);
  });

});