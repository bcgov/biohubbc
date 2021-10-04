import { COMPLETION_STATUS } from '../constants/status';
import { Feature } from 'geojson';
import moment from 'moment';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-view');

/**
 * Pre-processes GET /projects/{id} project data
 *
 * @export
 * @class GetProjectData
 */
export class GetProjectData {
  project_name: string;
  project_type: string;
  project_activities: number[];
  start_date: string;
  end_date: string;
  comments: string;
  completion_status: string;
  publish_date: string;

  constructor(projectData?: any, activityData?: any[]) {
    defaultLog.debug({
      label: 'GetProjectData',
      message: 'params',
      projectData: { ...projectData, geometry: 'Too big to print' },
      activityData
    });

    this.project_name = projectData?.name || '';
    this.project_type = projectData?.type || '';
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

  constructor(objectivesData?: any) {
    defaultLog.debug({
      label: 'GetObjectivesData',
      message: 'params',
      objectivesData: { ...objectivesData, geometry: 'Too big to print' }
    });

    this.objectives = objectivesData?.objectives || '';
    this.caveats = objectivesData?.caveats || '';
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
  }
}

interface IGetIUCN {
  classification: string;
  subClassification1: string;
  subClassification2: string;
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

/**
 * Pre-processes GET /projects/{id} partnerships data
 *
 * @export
 * @class GetPartnershipsData
 */
export class GetPartnershipsData {
  indigenous_partnerships: string[];
  stakeholder_partnerships: string[];

  constructor(indigenous_partnerships?: any[], stakeholder_partnerships?: any[]) {
    defaultLog.debug({
      label: 'GetPartnershipsData',
      message: 'params',
      indigenous_partnerships,
      stakeholder_partnerships
    });

    this.indigenous_partnerships =
      (indigenous_partnerships?.length && indigenous_partnerships.map((item: any) => item.fn_name)) || [];
    this.stakeholder_partnerships =
      (stakeholder_partnerships?.length && stakeholder_partnerships.map((item: any) => item.sp_name)) || [];
  }
}
