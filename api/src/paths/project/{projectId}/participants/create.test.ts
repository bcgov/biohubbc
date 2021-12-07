import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as create_project_participants from './create';
import * as db from '../../../../database/db';
//import * as project_participation_queries from '../../../../queries/project-participation/project-participation-queries';
//import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../../../__mocks__/db';
import { CustomError } from '../../../../errors/CustomError';

chai.use(sinonChai);

describe('creates a list of project participants', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {
      participants: [['jsmith', 'IDIR', 1]]
    },
    params: {
      projectId: 1
    }
  } as any;

  // let actualResult: any = null;

  // const sampleRes = {
  //   status: () => {
  //     return {
  //       json: (result: any) => {
  //         actualResult = result;
  //       }
  //     };
  //   }
  // };

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId in the param', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = create_project_participants.createProjectParticipants();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing required param `projectId`');
    }
  });

  it('should throw a 400 error when no participants in the request body', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = create_project_participants.createProjectParticipants();
      await result(
        { ...sampleReq, body: { ...sampleReq.body, participants: [] } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing required body param `participants`');
    }
  });
});
