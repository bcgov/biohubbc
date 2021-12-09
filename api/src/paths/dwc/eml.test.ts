import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../__mocks__/db';
import * as db from '../../database/db';
import { CustomError } from '../../errors/CustomError';
import * as eml from './eml';
import * as eml_queries from '../../queries/dwc/dwc-queries';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

const dbConnectionObj = getMockDBConnection({
  systemUserId: () => {
    return 20;
  }
});

describe('getSurveyDataPackageEML', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      data_package_id: 1
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no data package id is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = eml.getSurveyDataPackageEML();
      await requestHandler(
        { ...sampleReq, body: { ...sampleReq.body, data_package_id: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Missing required body param `data_package_id`.');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getSurveyOccurrenceSubmission', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      data_package_id: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no data package id is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      await eml.getSurveyOccurrenceSubmission(sampleReq.data_package_id, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal(
        'Failed to acquire distinct survey occurrence submission record'
      );
      expect((actualError as CustomError).status).to.equal(400);
    }
  });

  it('should throw a 400 error when no sql statement returned for getSurveyOccurrenceSubmissionSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getSurveyOccurrenceSubmissionSQL', sinon.fake.returns(null));

    try {
      await eml.getSurveyOccurrenceSubmission(sampleReq.data_package_id, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });

  it('should throw a 400 error when no rows returned', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: []
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    sinon.stub(eml_queries, 'getSurveyOccurrenceSubmissionSQL').returns(SQL`something`);

    try {
      await eml.getSurveyOccurrenceSubmission(sampleReq.data_package_id, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal(
        'Failed to acquire distinct survey occurrence submission record'
      );
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getDataPackage', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      data_package_id: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no data package id is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      await eml.getDataPackage(sampleReq.data_package_id, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to acquire data package record');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });

  it('should throw a 400 error when no sql statement returned for getDataPackageSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getDataPackageSQL', sinon.fake.returns(null));

    try {
      await eml.getDataPackage(sampleReq.data_package_id, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });

  it('should throw a 400 error when no rows returned', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: []
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    sinon.stub(eml_queries, 'getDataPackageSQL').returns(SQL`something`);

    try {
      await eml.getDataPackage(sampleReq.data_package_id, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to acquire data package record');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getPublishedSurveyStatus', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      occurrenceSubmissionId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getDataPackageSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getPublishedSurveyStatusSQL', sinon.fake.returns(null));

    try {
      await eml.getPublishedSurveyStatus(sampleReq.data_package_id, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getSurvey', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      surveyId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getSurveySQL', async () => {
    const fake = sinon.replace(eml_queries, 'getSurveySQL', sinon.fake.returns(null));

    try {
      await eml.getSurvey(sampleReq.surveyId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getProject', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      projectId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getProjectSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getProjectSQL', sinon.fake.returns(null));

    try {
      await eml.getProject(sampleReq.projectId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getSurveyFundingSource', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      surveyId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getSurveyFundingSourceSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getSurveyFundingSourceSQL', sinon.fake.returns(null));

    try {
      await eml.getSurveyFundingSource(sampleReq.surveyId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getProjectFundingSource', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      projectId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getSurveyFundingSourceSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getProjectFundingSourceSQL', sinon.fake.returns(null));

    try {
      await eml.getProjectFundingSource(sampleReq.projectId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getSurveyBoundingBox', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      surveyId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getSurveyBoundingBoxSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getGeometryBoundingBoxSQL', sinon.fake.returns(null));

    try {
      await eml.getSurveyBoundingBox(sampleReq.surveyId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getProjectBoundingBox', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      projectId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getProjectBoundingBoxSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getGeometryBoundingBoxSQL', sinon.fake.returns(null));

    try {
      await eml.getSurveyBoundingBox(sampleReq.projectId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getProjectBoundingBox', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      projectId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getProjectBoundingBoxSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getGeometryBoundingBoxSQL', sinon.fake.returns(null));

    try {
      await eml.getProjectBoundingBox(sampleReq.projectId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getSurveyPolygons', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      surveyId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getSurveyPolygonsSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getGeometryPolygonsSQL', sinon.fake.returns(null));

    try {
      await eml.getSurveyPolygons(sampleReq.surveyId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getProjectPolygons', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      projectId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getProjectPolygonsSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getGeometryPolygonsSQL', sinon.fake.returns(null));

    try {
      await eml.getProjectPolygons(sampleReq.projectId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getFocalTaxonomicCoverage', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      surveyId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getTaxonomicCoverageSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getTaxonomicCoverageSQL', sinon.fake.returns(null));

    try {
      await eml.getFocalTaxonomicCoverage(sampleReq.surveyId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getProjectIucnConservation', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      projectId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getProjectIucnConservationSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getProjectIucnConservationSQL', sinon.fake.returns(null));

    try {
      await eml.getProjectIucnConservation(sampleReq.projectId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getProjectStakeholderPartnership', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      projectId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getProjectStakeholderPartnershipSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getProjectStakeholderPartnershipSQL', sinon.fake.returns(null));

    try {
      await eml.getProjectStakeholderPartnership(sampleReq.projectId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getProjectActivity', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      projectId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getProjectActivitySQL', async () => {
    const fake = sinon.replace(eml_queries, 'getProjectActivitySQL', sinon.fake.returns(null));

    try {
      await eml.getProjectActivity(sampleReq.projectId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getProjectClimateInitiative', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      projectId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getProjectClimateInitiativeSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getProjectClimateInitiativeSQL', sinon.fake.returns(null));

    try {
      await eml.getProjectClimateInitiative(sampleReq.projectId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getProjectFirstNations', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      projectId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getProjectFirstNationsSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getProjectFirstNationsSQL', sinon.fake.returns(null));

    try {
      await eml.getProjectFirstNations(sampleReq.projectId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});

describe('getProjectManagementActions', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      projectId: null
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getProjectManagementActionsSQL', async () => {
    const fake = sinon.replace(eml_queries, 'getProjectManagementActionsSQL', sinon.fake.returns(null));

    try {
      await eml.getProjectManagementActions(sampleReq.projectId, dbConnectionObj);

      fake.should.have.returned(null);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});
