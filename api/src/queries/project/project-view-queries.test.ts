import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getIndigenousPartnershipsByProjectSQL,
  getIUCNActionClassificationByProjectSQL,
  getProjectListSQL,
  getProjectPermitsSQL,
  getProjectSQL
} from './project-view-queries';

describe('getProjectSQL', () => {
  describe('Null project id param provided', () => {
    it('returns null', () => {
      // force the function to accept a null value
      const response = getProjectSQL((null as unknown) as number);

      expect(response).to.be.null;
    });
  });

  describe('Valid project id param provided', () => {
    it('returns a SQLStatement', () => {
      const response = getProjectSQL(1);

      expect(response).to.not.be.null;
    });
  });
});

describe('getProjectListSQL', () => {
  it('returns null when no systemUserId provided', () => {
    const response = getProjectListSQL(true, null);

    expect(response).to.be.null;
  });

  it('returns a SQLStatement when isUserAdmin and systemUserId but no filter fields provided', () => {
    const response = getProjectListSQL(true, 3);

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when not isUserAdmin and systemUserId but no filter fields provided', () => {
    const response = getProjectListSQL(false, 3);

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (only contact agency)', () => {
    const response = getProjectListSQL(true, 1, { coordinator_agency: 'agency' });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (only permit number)', () => {
    const response = getProjectListSQL(true, 1, { permit_number: '123' });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (only project type)', () => {
    const response = getProjectListSQL(true, 1, { project_type: 'type' });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (only project name)', () => {
    const response = getProjectListSQL(true, 1, { project_name: 'name' });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (only agency project id)', () => {
    const response = getProjectListSQL(true, 1, { agency_project_id: 'agency_project_id' });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (only agency id)', () => {
    const response = getProjectListSQL(true, 1, { agency_id: 'agency_id' });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (only keyword)', () => {
    const response = getProjectListSQL(true, 1, { keyword: 'agency' });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (only species)', () => {
    const response = getProjectListSQL(true, 1, { species: ['species 1', 'species 2'] });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (only start date)', () => {
    const response = getProjectListSQL(true, 1, { start_date: '2020/04/04' });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (only end date)', () => {
    const response = getProjectListSQL(true, 1, { end_date: '2020/04/04' });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (both start and end dates)', () => {
    const response = getProjectListSQL(true, 1, { start_date: '2020/04/04', end_date: '2020/05/05' });

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

describe('getProjectPermitsSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectPermitsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = getProjectPermitsSQL(1);

    expect(response).to.not.be.null;
  });
});
