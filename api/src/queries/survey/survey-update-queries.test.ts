import { expect } from 'chai';
import { describe } from 'mocha';
import { PutSurveyDetailsData, PutSurveyProprietorData } from '../../models/survey-update';
import {
  putNewSurveyPermitNumberSQL,
  unassociatePermitFromSurveySQL,
  putSurveyDetailsSQL,
  putSurveyProprietorSQL,
  updateSurveyPublishStatusSQL
} from './survey-update-queries';
import { getSurveyDetailsForUpdateSQL } from './survey-view-update-queries';

describe('putSurveyDetailsSQL', () => {
  const surveyData: PutSurveyDetailsData = {
    name: 'test',
    objectives: 'objectives',
    focal_species: [1, 2],
    ancillary_species: [3, 4],
    start_date: '2020/04/04',
    end_date: '2020/05/05',
    lead_first_name: 'first',
    lead_last_name: 'last',
    revision_count: 1,
    location_name: 'location',
    permit_number: '12',
    permit_type: 'scientific',
    funding_sources: [1, 2],
    geometry: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-128, 55],
              [-128, 55.5],
              [-128, 56],
              [-126, 58],
              [-128, 55]
            ]
          ]
        },
        properties: {
          name: 'Biohub Islands'
        }
      }
    ]
  };

  it('returns null when null project id param provided', () => {
    const response = putSurveyDetailsSQL((null as unknown) as number, 1, surveyData, 1);

    expect(response).to.be.null;
  });

  it('returns null when null survey id param provided', () => {
    const response = putSurveyDetailsSQL(1, (null as unknown) as number, surveyData, 1);

    expect(response).to.be.null;
  });

  it('returns null when null survey data param provided', () => {
    const response = putSurveyDetailsSQL((null as unknown) as number, (null as unknown) as number, null, 1);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided with geometry', () => {
    const response = putSurveyDetailsSQL(1, 2, surveyData, 1);

    expect(response).to.not.be.null;
  });

  it('returns non null response when valid params provided without geometry', () => {
    const response = putSurveyDetailsSQL(1, 2, { ...surveyData, geometry: null as any }, 1);

    expect(response).to.not.be.null;
  });
});

describe('unassociatePermitFromSurveySQL', () => {
  it('returns null when no surveyId provided', () => {
    const response = unassociatePermitFromSurveySQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns sql statement when valid params provided', () => {
    const response = unassociatePermitFromSurveySQL(1);

    expect(response).to.not.be.null;
  });
});

describe('putNewSurveyPermitNumberSQL', () => {
  it('returns null when no surveyId provided', () => {
    const response = putNewSurveyPermitNumberSQL((null as unknown) as number, '123');

    expect(response).to.be.null;
  });

  it('returns null when no permit number provided', () => {
    const response = putNewSurveyPermitNumberSQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns sql statement when valid params provided', () => {
    const response = putNewSurveyPermitNumberSQL(1, '123');

    expect(response).to.not.be.null;
  });
});

describe('getSurveyForUpdateSQL', () => {
  it('returns null when no surveyId provided', () => {
    const response = getSurveyDetailsForUpdateSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns sql statement when valid params provided', () => {
    const response = getSurveyDetailsForUpdateSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('putSurveyProprietorSQL', () => {
  it('returns null when surveyId is falsey value not equal to 0', () => {
    const response = putSurveyProprietorSQL((null as unknown) as number, { prt_id: 1 } as PutSurveyProprietorData);

    expect(response).to.be.null;
  });

  it('returns null when survey proprietor id is falsey value not equal to 0', () => {
    const response = putSurveyProprietorSQL(1, (null as unknown) as PutSurveyProprietorData);

    expect(response).to.be.null;
  });

  it('returns a non null when valid params passed in', () => {
    const response = putSurveyProprietorSQL(1, { prt_id: 1 } as PutSurveyProprietorData);

    expect(response).to.not.be.null;
  });
});

describe('updateSurveyPublishStatusSQL', () => {
  describe('with invalid parameters', () => {
    it('returns null when survey is null', () => {
      const response = updateSurveyPublishStatusSQL((null as unknown) as number, true);

      expect(response).to.be.null;
    });
  });

  describe('with valid parameters', () => {
    it('returns a SQLStatement when there is a real date value', () => {
      const response = updateSurveyPublishStatusSQL(1, true);

      expect(response).to.not.be.null;
      expect(response?.values).to.deep.include(1);
    });

    it('returns a SQLStatement when the date value is null', () => {
      const response = updateSurveyPublishStatusSQL(1, false);

      expect(response).to.not.be.null;
      expect(response?.values).to.deep.include(1);
    });
  });
});
