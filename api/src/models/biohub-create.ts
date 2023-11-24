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
  // features: ObservationRecord[];

  constructor(obj: ObservationRecord) {
    defaultLog.debug({ label: 'PostSurveyObservationToBiohubObject', message: 'params', obj });

    this.id = String(obj.survey_observation_id);
    this.type = BiohubFeatureType.FEATURE;
    this.properties = {
      surveyId: obj.survey_id,
      wldtaxonomic_units_id: obj.wldtaxonomic_units_id,
      survey_sample_site_id: obj?.survey_sample_site_id || null,
      survey_sample_method_id: obj?.survey_sample_method_id || null,
      survey_sample_period_id: obj?.survey_sample_period_id || null,
      latitude: obj.latitude,
      longitude: obj.longitude,
      count: obj.count,
      observation_time: obj.observation_time,
      observation_date: obj.observation_date
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

  constructor(obj: GetSurveyData, obj2: ObservationRecord[], additionalInformation?: string) {
    defaultLog.debug({ label: 'PostSurveyToBiohubObject', message: 'params', obj });

    this.id = obj.uuid;
    this.type = BiohubFeatureType.DATASET;
    this.properties = {
      additionalInformation: additionalInformation || null,
      surveyId: obj.id,
      projectId: obj.project_id,
      name: obj.survey_name,
      startDate: obj.start_date,
      endDate: obj.end_date,
      surveyTypes: obj.survey_types,
      revisionCount: obj.revision_count,
      geometry: obj.geometry
    };
    this.features = obj2.map((observation) => new PostSurveyObservationToBiohubObject(observation));
  }
}

export enum BiohubFeatureType {
  DATASET = 'dataset',
  FEATURE = 'feature'
}
