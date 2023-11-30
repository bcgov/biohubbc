import { ObservationRecord } from '../repositories/observation-repository';
import { getLogger } from '../utils/logger';
import { GetSurveyData } from './survey-view';

const defaultLog = getLogger('models/biohub-create');

/**
 * Object to be sent to Biohub API for creating an observation.
 *
 * @export
 * @class PostSurveyObservationToBiohubObject
 */
export class PostSurveyObservationToBiohubObject {
  id: string;
  type: string;
  properties: object;

  constructor(observationRecord: ObservationRecord) {
    defaultLog.debug({ label: 'PostSurveyObservationToBiohubObject', message: 'params', observationRecord });

    this.id = String(observationRecord.survey_observation_id);
    this.type = BiohubFeatureType.OBSERVATION;
    this.properties = {
      surveyId: observationRecord.survey_id,
      wldtaxonomic_units_id: observationRecord.wldtaxonomic_units_id,
      survey_sample_site_id: observationRecord?.survey_sample_site_id || null,
      survey_sample_method_id: observationRecord?.survey_sample_method_id || null,
      survey_sample_period_id: observationRecord?.survey_sample_period_id || null,
      latitude: observationRecord.latitude,
      longitude: observationRecord.longitude,
      count: observationRecord.count,
      observation_time: observationRecord.observation_time,
      observation_date: observationRecord.observation_date
    };
  }
}

/**
 * Object to be sent to Biohub API for creating a survey.
 *
 * @export
 * @class PostSurveyToBiohubObject
 */
export class PostSurveyToBiohubObject {
  id: string;
  type: string;
  properties: object;
  features: PostSurveyObservationToBiohubObject[];

  constructor(surveyData: GetSurveyData, observationRecords: ObservationRecord[], additionalInformation?: string) {
    defaultLog.debug({ label: 'PostSurveyToBiohubObject', message: 'params', surveyData });

    this.id = surveyData.uuid;
    this.type = BiohubFeatureType.DATASET;
    this.properties = {
      additionalInformation: additionalInformation || null,
      surveyId: surveyData.id,
      projectId: surveyData.project_id,
      name: surveyData.survey_name,
      startDate: surveyData.start_date,
      endDate: surveyData.end_date,
      surveyTypes: surveyData.survey_types,
      revisionCount: surveyData.revision_count,
      geometry: surveyData.geometry
    };
    this.features = observationRecords.map((observation) => new PostSurveyObservationToBiohubObject(observation));
  }
}

export enum BiohubFeatureType {
  DATASET = 'dataset',
  OBSERVATION = 'observation'
}
