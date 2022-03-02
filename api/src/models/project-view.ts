import { COMPLETION_STATUS } from '../constants/status';
import { Feature } from 'geojson';
import moment from 'moment';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-view');

export interface IGetProject {
  id: number;
  coordinator: GetCoordinatorData | null;
  permit: any;
  project: any;
  objectives: GetObjectivesData | null;
  location: GetLocationData | null;
  iucn: GetIUCNClassificationData | null;
  funding: GetFundingData | null;
  partnerships: GetPartnershipsData | null;
}

/**
 * Pre-processes GET /projects/{id} project data
 *
 * @export
 * @class GetProjectData
 */
export class GetProjectData {
  project_name: string;
  project_type: number;
  project_activities: number[];
  start_date: string;
  end_date: string;
  comments: string;
  completion_status: string;
  publish_date: string;
  revision_count: number;

  constructor(projectData?: any, activityData?: any[]) {
    defaultLog.debug({
      label: 'GetProjectData',
      message: 'params',
      projectData: { ...projectData, geometry: 'Too big to print' },
      activityData
    });

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
    this.publish_date = projectData?.publish_date || '';
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
    defaultLog.debug({
      label: 'GetObjectivesData',
      message: 'params',
      objectivesData: { ...objectivesData, geometry: 'Too big to print' }
    });

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
    defaultLog.debug({
      label: 'GetCoordinatorData',
      message: 'params',
      coordinatorData: { ...coordinatorData, geometry: 'Too big to print' }
    });

    this.first_name = coordinatorData?.coordinator_first_name || '';
    this.last_name = coordinatorData?.coordinator_last_name || '';
    this.email_address = coordinatorData?.coordinator_email_address || '';
    this.coordinator_agency = coordinatorData?.coordinator_agency_name || '';
    this.share_contact_details = coordinatorData?.coordinator_public ? 'true' : 'false';
    this.revision_count = coordinatorData?.revision_count ?? null;
  }
}

export interface IGetPermit {
  permit_number: string;
  permit_type: string;
}

/**
 * Pre-processes GET /projects/{id} permit data
 *
 * @export
 * @class GetPermitData
 */
export class GetPermitData {
  permits: IGetPermit[];

  constructor(permitData?: any[]) {
    defaultLog.debug({
      label: 'GetPermitData',
      message: 'params',
      permitData: permitData
    });

    this.permits =
      (permitData?.length &&
        permitData.map((item: any) => {
          return {
            permit_number: item.number,
            permit_type: item.type
          };
        })) ||
      [];
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
    defaultLog.debug({
      label: 'GetLocationData',
      message: 'params',
      locationData: locationData?.map((item: any) => {
        return { ...item, geometry: 'Too big to print' };
      })
    });

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
    defaultLog.debug({
      label: 'GetIUCNClassificationData',
      message: 'params',
      iucnClassificationData: iucnClassificationData
    });

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
    defaultLog.debug({
      label: 'GetFundingData',
      message: 'params',
      fundingData: fundingData
    });

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
    defaultLog.debug({
      label: 'GetPartnershipsData',
      message: 'params',
      indigenous_partnerships,
      stakeholder_partnerships
    });

    this.indigenous_partnerships =
      (indigenous_partnerships?.length && indigenous_partnerships.map((item: any) => item.id)) || [];
    this.stakeholder_partnerships =
      (stakeholder_partnerships?.length && stakeholder_partnerships.map((item: any) => item.partnership_name)) || [];
  }
}
