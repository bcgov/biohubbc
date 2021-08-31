import { expect } from 'chai';
import { describe } from 'mocha';
import {
  PutCoordinatorData,
  PutLocationData,
  PutObjectivesData,
  PutProjectData,
  PutFundingSource
} from '../../models/project-update';
import {
  getIndigenousPartnershipsByProjectSQL,
  getCoordinatorByProjectSQL,
  getIUCNActionClassificationByProjectSQL,
  getObjectivesByProjectSQL,
  getProjectByProjectSQL,
  putProjectSQL,
  putProjectFundingSourceSQL,
  getPermitsByProjectSQL,
  updateProjectPublishStatusSQL
} from './project-update-queries';

describe('getIndigenousPartnershipsByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getIndigenousPartnershipsByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getIndigenousPartnershipsByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getPermitsByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getPermitsByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getPermitsByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getIUCNActionClassificationByProjectSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getIUCNActionClassificationByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = getIUCNActionClassificationByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getCoordinatorByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getCoordinatorByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getCoordinatorByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getProjectByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getProjectByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getProjectByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('putProjectSQL', () => {
  it('returns null when an invalid projectId is provided', () => {
    const response = putProjectSQL((null as unknown) as number, null, null, null, null, 1);

    expect(response).to.be.null;
  });

  it('returns null when a valid projectId but no data to update is provided', () => {
    const response = putProjectSQL(1, null, null, null, null, 1);

    expect(response).to.be.null;
  });

  it('returns valid sql when only project data is provided', () => {
    const response = putProjectSQL(
      1,
      new PutProjectData({
        name: 'project name',
        type: 1,
        start_date: '2020-04-20T07:00:00.000Z',
        end_date: '2020-05-20T07:00:00.000Z'
      }),
      null,
      null,
      null,
      1
    );

    expect(response).to.not.be.null;
  });

  it('returns valid sql when only location data is provided', () => {
    const response = putProjectSQL(
      1,
      null,
      new PutLocationData({
        location_description: 'description',
        geometry: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [125.6, 10.1]
            },
            properties: {
              name: 'Dinagat Islands'
            }
          }
        ]
      }),
      null,
      null,
      1
    );

    expect(response).to.not.be.null;
  });

  it('returns valid sql when only objectives data is provided', () => {
    const response = putProjectSQL(
      1,
      null,
      null,
      new PutObjectivesData({
        objectives: 'objectives',
        caveats: 'caveats',
        revision_count: 1
      }),
      null,
      1
    );

    expect(response).to.not.be.null;
  });

  it('returns valid sql when only coordinator data is provided', () => {
    const response = putProjectSQL(
      1,
      null,
      null,
      null,
      new PutCoordinatorData({
        first_name: 'first name',
        last_name: 'last name',
        email_address: 'email@email.com',
        coordinator_agency: 'agency',
        share_contact_details: 'true',
        revision_count: 1
      }),
      1
    );

    expect(response).to.not.be.null;
  });

  it('returns valid sql when all data is provided', () => {
    const response = putProjectSQL(
      1,
      new PutProjectData({
        name: 'project name',
        type: 1,
        start_date: '2020-04-20T07:00:00.000Z',
        end_date: '2020-05-20T07:00:00.000Z'
      }),
      new PutLocationData({
        location_description: 'description'
      }),
      new PutObjectivesData({
        objectives: 'objectives',
        caveats: 'caveats',
        revision_count: 1
      }),
      new PutCoordinatorData({
        first_name: 'first name',
        last_name: 'last name',
        email_address: 'email@email.com',
        coordinator_agency: 'agency',
        share_contact_details: 'true',
        revision_count: 1
      }),
      1
    );

    expect(response).to.not.be.null;
  });
});

describe('getObjectivesByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getObjectivesByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getObjectivesByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('putProjectFundingSourceSQL', () => {
  describe('with invalid parameters', () => {
    it('returns null when funding source is null', () => {
      const response = putProjectFundingSourceSQL((null as unknown) as PutFundingSource, 1);

      expect(response).to.be.null;
    });

    it('returns null when project id is null', () => {
      const response = putProjectFundingSourceSQL(new PutFundingSource({}), (null as unknown) as number);

      expect(response).to.be.null;
    });
  });

  describe('with valid parameters', () => {
    it('returns a SQLStatement when all fields are passed in as expected', () => {
      const response = putProjectFundingSourceSQL(
        new PutFundingSource({
          fundingSources: [
            {
              investment_action_category: 222,
              agency_project_id: 'funding source name',
              funding_amount: 10000,
              start_date: '2020-02-02',
              end_date: '2020-03-02',
              revision_count: 11
            }
          ]
        }),
        1
      );

      expect(response).to.not.be.null;
      expect(response?.values).to.deep.include(222);
      expect(response?.values).to.deep.include('funding source name');
      expect(response?.values).to.deep.include(10000);
      expect(response?.values).to.deep.include('2020-02-02');
      expect(response?.values).to.deep.include('2020-03-02');
    });
  });
});

describe('updateProjectPublishStatusSQL', () => {
  describe('with invalid parameters', () => {
    it('returns null when project is null', () => {
      const response = updateProjectPublishStatusSQL((null as unknown) as number, true);

      expect(response).to.be.null;
    });
  });

  describe('with valid parameters', () => {
    it('returns a SQLStatement when there is a real date value', () => {
      const response = updateProjectPublishStatusSQL(1, true);

      expect(response).to.not.be.null;
      expect(response?.values).to.deep.include(1);
    });

    it('returns a SQLStatement when the date value is null', () => {
      const response = updateProjectPublishStatusSQL(1, false);

      expect(response).to.not.be.null;
      expect(response?.values).to.deep.include(1);
    });
  });
});
