import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as update from './update';
import * as db from '../../../database/db';
import { IUpdateProject } from './update';
import project_queries from '../../../queries/project';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../../__mocks__/db';
import { HTTPError } from '../../../errors/custom-error';

chai.use(sinonChai);

describe('updateProjectPermitData', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const projectId = 1;
  const entities = {
    permit: {
      permits: [
        {
          permit_number: 1,
          permit_type: 'type'
        }
      ]
    },
    coordinator: {
      first_name: 'first',
      last_name: 'last',
      email_address: 'email@example.com',
      coordinator_agency: 'agency',
      share_contact_details: 'true',
      revision_count: 1
    }
  } as IUpdateProject;

  it('should throw a 400 error when no permit entities', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      await update.updateProjectPermitData(projectId, { ...entities, permit: null }, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing request body entity `permit`');
    }
  });

  it('should throw a 400 error when failed to generate delete permit SQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_queries, 'deletePermitSQL').returns(null);

    try {
      await update.updateProjectPermitData(projectId, entities, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
    }
  });

  it('should throw a 409 error when failed to delete permit', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves(null);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'deletePermitSQL').returns(SQL`something`);

    try {
      await update.updateProjectPermitData(projectId, entities, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(409);
      expect((actualError as HTTPError).message).to.equal('Failed to delete project permit data');
    }
  });
});
