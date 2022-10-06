import chai from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

// const dbConnection = getMockDBConnection({
//   systemUserId: () => {
//     return 20;
//   }
// });

// const sampleReq = {
//   keycloak_token: {},
//   body: {
//     occurrence_submission_id: 1
//   }
// } as any;

describe('ValidationService', () => {
  afterEach(() => {
    sinon.restore();
  });

  // it('', async () => {
  //   const dbConnection = getMockDBConnection();
  //   const service = new ValidationService(dbConnection);
  // });

  // it('', async () => {
  //   const dbConnection = getMockDBConnection();
  //   const service = new ValidationService(dbConnection);
  // });
});
