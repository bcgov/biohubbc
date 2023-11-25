import { expect } from 'chai';
import { describe } from 'mocha';
import { ObservationRecord } from '../repositories/observation-repository';
import { PostSurveyObservationToBiohubObject, PostSurveyToBiohubObject } from './biohub-create';
import { GetSurveyData } from './survey-view';

describe('PostSurveyObservationToBiohubObject', () => {
  describe('All values provided', () => {
    let data: PostSurveyObservationToBiohubObject;

    const obj = {
      survey_observation_id: 1,
      survey_id: 1,
      wldtaxonomic_units_id: 1,
      survey_sample_site_id: 1,
      survey_sample_method_id: 1,
      survey_sample_period_id: 1,
      latitude: 1,
      longitude: 1,
      count: 1,
      observation_time: 'observation_time',
      observation_date: 'observation_date',
      create_date: 'create_date',
      create_user: 1,
      update_date: 'update_date',
      update_user: 1,
      revision_count: 1
    } as ObservationRecord;

    before(() => {
      data = new PostSurveyObservationToBiohubObject(obj);
    });

    it('sets id', () => {
      expect(data.id).to.equal('1');
    });

    it('sets type', () => {
      expect(data.type).to.equal('observation');
    });

    it('sets properties', () => {
      expect(data.properties).to.eql({
        surveyId: 1,
        wldtaxonomic_units_id: 1,
        survey_sample_site_id: 1,
        survey_sample_method_id: 1,
        survey_sample_period_id: 1,
        latitude: 1,
        longitude: 1,
        count: 1,
        observation_time: 'observation_time',
        observation_date: 'observation_date'
      });
    });
  });
});

describe('PostSurveyToBiohubObject', () => {
  describe('All values provided', () => {
    let data: PostSurveyToBiohubObject;

    const observation_obj = {
      survey_observation_id: 1,
      survey_id: 1,
      wldtaxonomic_units_id: 1,
      survey_sample_site_id: 1,
      survey_sample_method_id: 1,
      survey_sample_period_id: 1,
      latitude: 1,
      longitude: 1,
      count: 1,
      observation_time: 'observation_time',
      observation_date: 'observation_date',
      create_date: 'create_date',
      create_user: 1,
      update_date: 'update_date',
      update_user: 1,
      revision_count: 1
    } as ObservationRecord;

    const survey_obj = {
      id: 1,
      uuid: '1',
      project_id: 1,
      survey_name: 'survey_name',
      start_date: 'start_date',
      end_date: 'end_date',
      survey_types: [9],
      revision_count: 1,
      create_date: 'create_date',
      create_user: 1,
      update_date: 'update_date',
      update_user: 1,
      geometry: []
    } as GetSurveyData;

    before(() => {
      data = new PostSurveyToBiohubObject(survey_obj, [observation_obj], 'additionalInformation');
    });

    it('sets id', () => {
      expect(data.id).to.equal('1');
    });

    it('sets type', () => {
      expect(data.type).to.equal('dataset');
    });

    it('sets properties', () => {
      expect(data.properties).to.eql({
        additionalInformation: 'additionalInformation',
        surveyId: 1,
        projectId: 1,
        name: 'survey_name',
        startDate: 'start_date',
        endDate: 'end_date',
        surveyTypes: [9],
        revisionCount: 1,
        geometry: []
      });
    });

    it('sets features', () => {
      expect(data.features).to.eql([
        {
          id: '1',
          type: 'observation',
          properties: {
            surveyId: 1,
            wldtaxonomic_units_id: 1,
            survey_sample_site_id: 1,
            survey_sample_method_id: 1,
            survey_sample_period_id: 1,
            latitude: 1,
            longitude: 1,
            count: 1,
            observation_time: 'observation_time',
            observation_date: 'observation_date'
          }
        }
      ]);
    });
  });
});
