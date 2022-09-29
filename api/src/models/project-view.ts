import { Feature } from 'geojson';
import moment from 'moment';
import { COMPLETION_STATUS } from '../constants/status';

export interface IGetProject {
  id: number;
  coordinator: GetCoordinatorData;
  project: GetProjectData;
  objectives: GetObjectivesData;
  location: GetLocationData;
  iucn: GetIUCNClassificationData;
  funding: GetFundingData;
  partnerships: GetPartnershipsData;
}

/**
 * Pre-processes GET /projects/{id} project data
 *
 * @export
 * @class GetProjectData
 */
export class GetProjectData {
  uuid: string;
  project_name: string;
  project_type: number;
  project_activities: number[];
  start_date: string;
  end_date: string;
  comments: string;
  completion_status: string;
  revision_count: number;

  constructor(projectData?: any, activityData?: any[]) {
    this.uuid = projectData?.uuid || '';
    this.project_name = projectData?.name || '';
    this.project_type = projectData?.pt_id || -1;
    this.project_activities = (activityData?.length && activityData.map((item) => item.activity_id)) || [];
    this.start_date = projectData?.start_date || '';
    this.end_date = projectData?.end_date || '';
    this.comments = projectData?.comments || '';
    this.completion_status =
      (projectData &&
        projectData.end_date &&
        moment(projectData.end_date).endOf('day').isBefore(moment()) &&
        COMPLETION_STATUS.COMPLETED) ||
      COMPLETION_STATUS.ACTIVE;
    this.revision_count = projectData?.revision_count ?? null;
  }
}

/**
 * Pre-processes GET /projects/{id} objectives data
 *
 * @export
 * @class GetObjectivesData
 */
export class GetObjectivesData {
  objectives: string;
  caveats: string;
  revision_count: number;

  constructor(objectivesData?: any) {
    this.objectives = objectivesData?.objectives || '';
    this.caveats = objectivesData?.caveats || '';
    this.revision_count = objectivesData?.revision_count ?? null;
  }
}

/**
 * Pre-processes GET /projects/{id} coordinator data
 *
 * @export
 * @class GetCoordinatorData
 */
export class GetCoordinatorData {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: string;
  revision_count: number;

  constructor(coordinatorData?: any) {
    this.first_name = coordinatorData?.coordinator_first_name || '';
    this.last_name = coordinatorData?.coordinator_last_name || '';
    this.email_address = coordinatorData?.coordinator_email_address || '';
    this.coordinator_agency = coordinatorData?.coordinator_agency_name || '';
    this.share_contact_details = coordinatorData?.coordinator_public ? 'true' : 'false';
    this.revision_count = coordinatorData?.revision_count ?? null;
  }
}

/**
 * Pre-processes GET /projects/{id} location data
 *
 * @export
 * @class GetLocationData
 */
export class GetLocationData {
  location_description: string;
  geometry?: Feature[];
  revision_count: number;

  constructor(locationData?: any) {
    const locationDataItem = locationData && locationData.length && locationData[0];

    this.location_description = locationDataItem?.location_description || '';
    this.geometry = (locationDataItem?.geometry?.length && locationDataItem.geometry) || [];
    this.revision_count = locationDataItem?.revision_count ?? null;
  }
}

interface IGetIUCN {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

/**
 * Pre-processes GET /projects/{id} IUCN classification data
 *
 * @export
 * @class GetIUCNClassificationData
 */
export class GetIUCNClassificationData {
  classificationDetails: IGetIUCN[];

  constructor(iucnClassificationData?: any[]) {
    this.classificationDetails =
      (iucnClassificationData &&
        iucnClassificationData.map((item: any) => {
          return {
            classification: item.classification,
            subClassification1: item.subclassification1,
            subClassification2: item.subclassification2
          };
        })) ||
      [];
  }
}

interface IGetFundingSource {
  id: number;
  agency_id: number;
  investment_action_category: number;
  investment_action_category_name: string;
  agency_name: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
  agency_project_id: string;
  revision_count: number;
}

export class GetFundingData {
  fundingSources: IGetFundingSource[];

  constructor(fundingData?: any[]) {
    this.fundingSources =
      (fundingData &&
        fundingData.map((item: any) => {
          return {
            id: item.id,
            agency_id: item.agency_id,
            investment_action_category: item.investment_action_category,
            investment_action_category_name: item.investment_action_category_name,
            agency_name: item.agency_name,
            funding_amount: item.funding_amount,
            start_date: item.start_date,
            end_date: item.end_date,
            agency_project_id: item.agency_project_id,
            revision_count: item.revision_count
          };
        })) ||
      [];
  }
}

/**
 * Pre-processes GET /projects/{id} partnerships data
 *
 * @export
 * @class GetPartnershipsData
 */
export class GetPartnershipsData {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];

  constructor(indigenous_partnerships?: any[], stakeholder_partnerships?: any[]) {
    this.indigenous_partnerships =
      (indigenous_partnerships?.length && indigenous_partnerships.map((item: any) => item.id)) || [];
    this.stakeholder_partnerships =
      (stakeholder_partnerships?.length && stakeholder_partnerships.map((item: any) => item.partnership_name)) || [];
  }
}

interface IGetAttachmentsSource {
  file_name: string;
  file_type: string;
  title: string;
  description: string;
  key: string;
  file_size: string;
  is_secure: string;
}

/**
 * Pre-processes GET /projects/{id} attachments data
 *
 * @export
 * @class GetAttachmentsData
 */
export class GetAttachmentsData {
  attachmentDetails: IGetAttachmentsSource[];

  constructor(attachments?: any[]) {
    this.attachmentDetails =
      (attachments?.length &&
        attachments.map((item: any) => {
          return {
            file_name: item.file_name,
            file_type: item.file_type,
            title: item.title,
            description: item.description,
            key: item.security_token ? '' : item.key,
            file_size: item.file_size,
            is_secure: item.security_token ? 'true' : 'false'
          };
        })) ||
      [];
  }
}

interface IGetReportAttachmentsSource {
  file_name: string;
  title: string;
  year: string;
  description: string;
  key: string;
  file_size: string;
  is_secure: string;
  authors?: { author: string }[];
}

/**
 * Pre-processes GET /projects/{id} report attachments data
 *
 * @export
 * @class GetReportAttachmentsData
 */
export class GetReportAttachmentsData {
  attachmentDetails: IGetReportAttachmentsSource[];

  constructor(attachments?: any[]) {
    this.attachmentDetails =
      (attachments?.length &&
        attachments.map((item: any) => {
          const attachmentItem = {
            file_name: item.file_name,
            title: item.title,
            year: item.year,
            description: item.description,
            key: item.security_token ? '' : item.key,
            file_size: item.file_size,
            is_secure: item.security_token ? 'true' : 'false'
          };

          if (item.authors?.length) {
            attachmentItem['authors'] = item.authors;
          }

          return attachmentItem;
        })) ||
      [];
  }
}
