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
  it('returns a SQLStatement when no filter fields provided', () => {
    const response = getProjectListSQL();

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (only coordinator agency)', () => {
    const response = getProjectListSQL({ coordinator_agency: 'agency' });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (only start date)', () => {
    const response = getProjectListSQL({ start_date: '2020/04/04' });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (only end date)', () => {
    const response = getProjectListSQL({ end_date: '2020/04/04' });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when filter fields provided (both start and end dates)', () => {
    const response = getProjectListSQL({ start_date: '2020/04/04', end_date: '2020/05/05' });

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
