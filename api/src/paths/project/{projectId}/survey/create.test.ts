import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as create from './create';
import * as db from '../../../../database/db';
// import * as user_queries from '../../../../queries/users/user-queries';
// import { QueryResult } from 'pg';
// import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('createSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = {
    systemUserId: () => {
      return null;
    },
    open: async () => {
      // do nothing
    },
    release: () => {
      // do nothing
    },
    commit: async () => {
      // do nothing
    },
    rollback: async () => {
      // do nothing
    },
    query: async () => {
      // do nothing
    }
  };

  const sampleReq = {
    keycloak_token: {},
    body: {
      biologist_first_name: 'Roanna',
      biologist_last_name: 'Brown',
      category_rational: '',
      data_sharing_agreement_required: 'false',
      end_date: '2080-12-30',
      first_nations_id: 0,
      foippa_requirements_accepted: true,
      management_unit: 'Management unit 1',
      park: 'Park name 1',
      proprietary_data_category: 0,
      proprietor_name: '',
      sedis_procedures_accepted: true,
      species: 'Alkaline Wing-nerved Moss [Pterygoneurum kozlovii]',
      start_date: '1925-12-23',
      survey_area_name: 'Armand French',
      survey_data_proprietary: 'false',
      survey_name: 'Odysseus Noel',
      survey_purpose: 'Sint temporibus aut'
    }
  } as any;

  // let actualResult = {
  //   id: null,
  //   date: null
  // };

  // const sampleReq = {
  //   keycloak_token: {},
  //   body:{

  //   }
  // } as any;

  // let actualResult = {
  //   id: null
  // };

  // const sampleRes = {
  //   status: () => {
  //     return {
  //       json: (result: any) => {
  //         actualResult = result;
  //       }
  //     };
  //   }
  // };

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = create.createSurvey();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      console.log(actualError);
      //expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal("Cannot read property 'projectId' of undefined");
    }
  });
});
