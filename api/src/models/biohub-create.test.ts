import { expect } from 'chai';
import { FeatureCollection } from 'geojson';
import { describe } from 'mocha';
import { ObservationRecord } from '../repositories/observation-repository';
import {
  PostSurveyObservationToBiohubObject,
  PostSurveySubmissionToBioHubObject,
  PostSurveyToBiohubObject
} from './biohub-create';
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
        survey_id: 1,
        taxonomy: 1,
        survey_sample_site_id: 1,
        survey_sample_method_id: 1,
        survey_sample_period_id: 1,
        latitude: 1,
        longitude: 1,
        count: 1,
        observation_time: 'observation_time',
        observation_date: 'observation_date',
        geometry: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [1, 1]
              },
              properties: {}
            }
          ]
        }
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
      data = new PostSurveyToBiohubObject(survey_obj, [observation_obj], { type: 'FeatureCollection', features: [] });
    });

    it('sets id', () => {
      expect(data.id).to.equal('1');
    });

    it('sets type', () => {
      expect(data.type).to.equal('dataset');
    });

    it('sets properties', () => {
      expect(data.properties).to.eql({
        survey_id: 1,
        project_id: 1,
        name: 'survey_name',
        start_date: 'start_date',
        end_date: 'end_date',
        survey_types: [9],
        revision_count: 1,
        geometry: { type: 'FeatureCollection', features: [] }
      });
    });

    it('sets features', () => {
      expect(data.features).to.eql([new PostSurveyObservationToBiohubObject(observation_obj)]);
    });
  });
});

describe('PostSurveySubmissionToBioHubObject', () => {
  describe('All values provided', () => {
    let data: PostSurveySubmissionToBioHubObject;

    const observation_obj: ObservationRecord[] = [
      {
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
      }
    ];

    const survey_obj: GetSurveyData = {
      id: 1,
      uuid: '1',
      project_id: 1,
      survey_name: 'survey_name',
      start_date: 'start_date',
      end_date: 'end_date',
      survey_types: [9],
      revision_count: 1
    };

    const survey_geometry: FeatureCollection = {
      type: 'FeatureCollection',
      features: []
    };

    const additionalInformation = 'A description of the submission';

    before(() => {
      data = new PostSurveySubmissionToBioHubObject(
        survey_obj,
        observation_obj,
        survey_geometry,
        additionalInformation
      );
    });

    it('sets id', () => {
      expect(data.id).to.equal('1');
    });

    it('sets name', () => {
      expect(data.name).to.equal('survey_name');
    });

    it('sets description', () => {
      expect(data.description).to.equal('A description of the submission');
    });

    it('sets features', () => {
      expect(data.features).to.eql([new PostSurveyToBiohubObject(survey_obj, observation_obj, survey_geometry)]);
    });
  });
});
