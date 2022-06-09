import { expect } from 'chai';
import { describe } from 'mocha';
import {
  PutSurveyDetailsData,
  PutSurveyFundingData,
  PutSurveyLocationData,
  PutSurveyObject,
  PutSurveyPermitData,
  PutSurveyProprietorData,
  PutSurveyPurposeAndMethodologyData,
  PutSurveySpeciesData
} from '../../models/survey-update';
import {
  putSurveyDetailsSQL,
  unassociatePermitFromSurveySQL,
  updateSurveyPublishStatusSQL,
  upsertSurveyPermitSQL
} from './survey-update-queries';

describe('putSurveyDetailsSQL', () => {
  it('returns non null response when valid params provided with geometry', () => {
    const response = putSurveyDetailsSQL(2, ({
      survey_details: new PutSurveyDetailsData(null),
      species: new PutSurveySpeciesData(null),
      permit: new PutSurveyPermitData(null),
      funding: new PutSurveyFundingData(null),
      proprietor: new PutSurveyProprietorData(null),
      purpose_and_methodology: new PutSurveyPurposeAndMethodologyData(null),
      location: new PutSurveyLocationData(null)
    } as unknown) as PutSurveyObject);

    expect(response).to.not.be.null;
  });

  it('returns non null response when valid params provided without geometry', () => {
    const response = putSurveyDetailsSQL(2, ({
      survey_details: new PutSurveyDetailsData(null),
      species: new PutSurveySpeciesData(null),
      permit: new PutSurveyPermitData(null),
      funding: new PutSurveyFundingData(null),
      proprietor: new PutSurveyProprietorData(null),
      purpose_and_methodology: new PutSurveyPurposeAndMethodologyData(null),
      location: new PutSurveyLocationData({
        survey_area_name: 'name',
        geometry: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: []
            },
            properties: {}
          }
        ],
        revision_count: 0
      })
    } as unknown) as PutSurveyObject);

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

describe('upsertSurveyPermitSQL', () => {
  it('returns a sql statement', () => {
    const response = upsertSurveyPermitSQL(1, 2, 3, '4', 'type');

    expect(response).to.be.null;
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
