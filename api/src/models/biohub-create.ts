import { FeatureCollection } from 'geojson';
import { ATTACHMENT_TYPE } from '../constants/attachments';
import { ISurveyAttachment, ISurveyReportAttachment } from '../repositories/attachment-repository';
import { ObservationRecord } from '../repositories/observation-repository/observation-repository';
import { getLogger } from '../utils/logger';
import { GetSurveyData, GetSurveyPurposeAndMethodologyData } from './survey-view';

const defaultLog = getLogger('models/biohub-create');

export interface BioHubSubmission {
  id: string;
  name: string;
  description: string;
  content: BioHubSubmissionFeature;
}
export interface BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];
}

/**
 * Object to be sent to Biohub API for creating an observation.
 *
 * @export
 * @class PostSurveyObservationToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyObservationToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(observationRecord: ObservationRecord) {
    defaultLog.debug({ label: 'PostSurveyObservationToBiohubObject', message: 'params', observationRecord });

    this.id = String(observationRecord.survey_observation_id);
    this.type = BiohubFeatureType.OBSERVATION;
    this.properties = {
      survey_id: observationRecord.survey_id,
      taxonomy: observationRecord.itis_tsn,
      survey_sample_site_id: observationRecord?.survey_sample_site_id || null,
      survey_sample_method_id: observationRecord?.survey_sample_method_id || null,
      survey_sample_period_id: observationRecord?.survey_sample_period_id || null,
      latitude: observationRecord.latitude,
      longitude: observationRecord.longitude,
      count: observationRecord.count,
      observation_time: observationRecord.observation_time,
      observation_date: observationRecord.observation_date,
      geometry: {
        type: 'FeatureCollection',
        features:
          observationRecord.longitude && observationRecord.latitude
            ? [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [observationRecord.longitude, observationRecord.latitude]
                  },
                  properties: {}
                }
              ]
            : []
      }
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating an artifact (for a SIMS attachment).
 *
 * @export
 * @class PostSurveyAttachmentsToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyAttachmentsToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(attachmentRecord: ISurveyAttachment) {
    defaultLog.debug({ label: 'PostSurveyAttachmentsToBiohubObject', message: 'params', attachmentRecord });

    this.id = attachmentRecord.uuid;
    this.type = BiohubFeatureType.ARTIFACT;
    this.properties = {
      artifact_id: attachmentRecord.survey_attachment_id,
      filename: attachmentRecord.file_name,
      file_type: attachmentRecord.file_type,
      file_size: attachmentRecord.file_size,
      title: attachmentRecord?.title || null,
      description: attachmentRecord?.description || null
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating an artifact (for a SIMS report attachment).
 *
 * @export
 * @class PostSurveyReportAttachmentsToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyReportAttachmentsToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, any>;
  child_features: BioHubSubmissionFeature[];

  constructor(reportAttachmentRecord: ISurveyReportAttachment) {
    defaultLog.debug({ label: 'PostSurveyReportAttachmentsToBiohubObject', message: 'params', reportAttachmentRecord });

    this.id = reportAttachmentRecord.uuid;
    this.type = BiohubFeatureType.ARTIFACT;
    this.properties = {
      artifact_id: reportAttachmentRecord.survey_report_attachment_id,
      filename: reportAttachmentRecord.file_name,
      file_type: ATTACHMENT_TYPE.REPORT,
      file_size: reportAttachmentRecord.file_size,
      title: reportAttachmentRecord.title,
      description: reportAttachmentRecord.description,
      year_published: reportAttachmentRecord.year_published
    };
    this.child_features = [];
  }
}

/**
 * Object to be sent to Biohub API for creating a survey.
 *
 * @export
 * @class PostSurveyToBiohubObject
 * @implements {BioHubSubmissionFeature}
 */
export class PostSurveyToBiohubObject implements BioHubSubmissionFeature {
  id: string;
  type: string;
  properties: Record<string, any>;
  child_features: PostSurveyObservationToBiohubObject[];

  constructor(
    surveyData: GetSurveyData,
    observationRecords: ObservationRecord[],
    surveyGeometry: FeatureCollection,
    surveyAttachments: ISurveyAttachment[],
    surveyReports: ISurveyReportAttachment[]
  ) {
    defaultLog.debug({ label: 'PostSurveyToBiohubObject', message: 'params', surveyData });

    const observationFeatures = observationRecords.map(
      (observation) => new PostSurveyObservationToBiohubObject(observation)
    );

    const attachmentFeatures = surveyAttachments.map(
      (attachment) => new PostSurveyAttachmentsToBiohubObject(attachment)
    );

    const reportAttachmentFeatures = surveyReports.map(
      (attachment) => new PostSurveyReportAttachmentsToBiohubObject(attachment)
    );

    this.id = surveyData.uuid;
    this.type = BiohubFeatureType.DATASET;
    this.properties = {
      survey_id: surveyData.id,
      project_id: surveyData.project_id,
      name: surveyData.survey_name,
      start_date: surveyData.start_date,
      end_date: surveyData.end_date,
      survey_types: surveyData.survey_types,
      revision_count: surveyData.revision_count,
      geometry: surveyGeometry
    };
    this.child_features = [...observationFeatures, ...reportAttachmentFeatures, ...attachmentFeatures];
  }
}

export class PostSurveySubmissionToBioHubObject implements BioHubSubmission {
  id: string;
  name: string;
  description: string;
  comment: string;
  content: BioHubSubmissionFeature;

  constructor(
    surveyData: GetSurveyData,
    GetSurveyPurposeAndMethodologyData: GetSurveyPurposeAndMethodologyData,
    observationRecords: ObservationRecord[],
    surveyGeometry: FeatureCollection,
    surveyAttachments: ISurveyAttachment[],
    surveyReports: ISurveyReportAttachment[],
    submissionComment: string
  ) {
    defaultLog.debug({ label: 'PostSurveySubmissionToBioHubObject' });

    this.id = surveyData.uuid;
    this.name = surveyData.survey_name;
    this.description = GetSurveyPurposeAndMethodologyData.additional_details;
    this.comment = submissionComment;
    this.content = new PostSurveyToBiohubObject(
      surveyData,
      observationRecords,
      surveyGeometry,
      surveyAttachments,
      surveyReports
    );
  }
}

export enum BiohubFeatureType {
  DATASET = 'dataset',
  OBSERVATION = 'observation',
  ARTIFACT = 'artifact'
}
