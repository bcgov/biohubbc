import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as project from './project';
import * as db from '../database/db';
import project_queries from '../queries/project';
import { getMockDBConnection } from '../__mocks__/db';
import { HTTPError } from '../errors/custom-error';

chai.use(sinonChai);

describe('createProject', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body1: {
      coordinator: {
        first_name: 'John',
        last_name: 'Smith',
        email_address: 'a@b.com',
        coordinator_agency: 'A Rocha Canada',
        share_contact_details: 'false'
      },
      permit: { permits: [], existing_permits: [] },
      project: {
        project_name: 'Tatyana Douglas',
        project_type: 2,
        project_activities: [],
        start_date: '1900-01-01',
        end_date: ''
      },
      objectives: { objectives: 'an objective', caveats: '' },
      location: {
        regions: ['West Coast'],
        location_description: '',
        geometry: [
          { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [-124.716797, 52.88902] } }
        ]
      },
      iucn: { classificationDetails: [] },
      funding: { funding_sources: [] },
      partnerships: { indigenous_partnerships: [], stakeholder_partnerships: [] }
    },
    params: {
      projectId: 1
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no request body present', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = project.createProject();

      await result({ ...sampleReq, body: null }, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to insert project general information data');
    }
  });

  it('should throw a 400 error when no sql statement returned for postProjectSQLStatement', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_queries, 'postProjectSQL').returns(null);

    try {
      const result = project.createProject();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
    }
  });
});
