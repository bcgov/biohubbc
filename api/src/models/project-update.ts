import { Feature } from 'geojson';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-update');

export class PutIUCNData {
  classificationDetails: IGetPutIUCN[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutIUCNData', message: 'params', obj });

    this.classificationDetails =
      (obj?.classificationDetails?.length &&
        obj.classificationDetails.map((item: any) => {
          return {
            classification: item.classification,
            subClassification1: item.subClassification1,
            subClassification2: item.subClassification2
          };
        })) ||
      [];
  }
}

export class PutProjectData {
  name: string;
  type: number;
  project_activities: number[];
  start_date: string;
  end_date: string;
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutProjectData', message: 'params', obj });

    this.name = obj?.project_name || null;
    this.type = obj?.project_type || null;
    this.project_activities = (obj?.project_activities?.length && obj.project_activities) || [];
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.revision_count = obj?.revision_count ?? null;
  }
}

export class PutLocationData {
  location_description: string;
  geometry: Feature[];
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({
      label: 'PutLocationData',
      message: 'params',
      obj: {
        ...obj,
        geometry: obj?.geometry?.map((item: any) => {
          return { ...item, geometry: 'Too big to print' };
        })
      }
    });

    this.location_description = (obj && obj.location_description) || null;
    this.geometry = (obj?.geometry?.length && obj.geometry) || [];
    this.revision_count = obj?.revision_count ?? null;
  }
}

export class PutObjectivesData {
  objectives: string;
  caveats: string;
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutObjectivesData', message: 'params', obj });

    this.objectives = obj?.objectives || '';
    this.caveats = obj?.caveats || '';
    this.revision_count = obj?.revision_count ?? null;
  }
}

export class PutCoordinatorData {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: boolean;
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutCoordinatorData', message: 'params', obj });

    this.first_name = obj?.first_name || null;
    this.last_name = obj?.last_name || null;
    this.email_address = obj?.email_address || null;
    this.coordinator_agency = obj?.coordinator_agency || null;
    this.share_contact_details = (obj?.share_contact_details === 'true' && true) || false;
    this.revision_count = obj?.revision_count ?? null;
  }
}

export class PutPartnershipsData {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutPartnershipsData', message: 'params', obj });

    this.indigenous_partnerships = (obj?.indigenous_partnerships?.length && obj.indigenous_partnerships) || [];
    this.stakeholder_partnerships = (obj?.stakeholder_partnerships?.length && obj.stakeholder_partnerships) || [];
  }
}

export class GetCoordinatorData {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: string;
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'GetCoordinatorData', message: 'params', obj });

    this.first_name = obj?.coordinator_first_name || null;
    this.last_name = obj?.coordinator_last_name || null;
    this.email_address = obj?.coordinator_email_address || null;
    this.coordinator_agency = obj?.coordinator_agency_name || null;
    this.share_contact_details = (obj?.coordinator_public && 'true') || 'false';
    this.revision_count = obj?.revision_count ?? null;
  }
}

/**
 * Pre-processes GET /projects/{id} partnerships data for editing purposes
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
      (stakeholder_partnerships?.length && stakeholder_partnerships.map((item: any) => item.name)) || [];
  }
}

export interface IGetPutIUCN {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

/**
 * Pre-processes GET /projects/{id} IUCN classification data for editing purposes
 *
 * @export
 * @class GetIUCNClassificationData
 */
export class GetIUCNClassificationData {
  classificationDetails: IGetPutIUCN[];

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

export class GetObjectivesData {
  objectives: string;
  caveats: string;
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'GetObjectivesData', message: 'params', obj });

    this.objectives = obj?.objectives || '';
    this.caveats = obj?.caveats || '';
    this.revision_count = obj?.revision_count ?? null;
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

/**
 * Pre-processes GET /projects/{projectId}/update project data
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
  revision_count: number;
  publish_date: string;

  constructor(projectData?: any, activityData?: any[]) {
    defaultLog.debug({ label: 'GetProjectData', message: 'params', projectData, activityData });

    this.project_name = projectData?.name || '';
    this.project_type = projectData?.pt_id || '';
    this.project_activities = (activityData?.length && activityData.map((item) => item.activity_id)) || [];
    this.start_date = projectData?.start_date || '';
    this.end_date = projectData?.end_date || '';
    this.revision_count = projectData?.revision_count ?? null;
    this.publish_date = projectData?.publish_date || '';
  }
}

export class PutFundingSource {
  id: number;
  investment_action_category: number;
  agency_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutFundingSource', message: 'params', obj });

    const fundingSource = obj?.fundingSources?.length && obj.fundingSources[0];

    this.id = fundingSource?.id || null;
    this.investment_action_category = fundingSource?.investment_action_category || null;
    this.agency_project_id = fundingSource?.agency_project_id || null;
    this.funding_amount = fundingSource?.funding_amount || null;
    this.start_date = fundingSource?.start_date || null;
    this.end_date = fundingSource?.end_date || null;
    this.revision_count = fundingSource?.revision_count ?? null;
  }
}

interface IGetPermit {
  permit_number: string;
  permit_type: string;
}

/**
 * Pre-processes GET /projects/{projectId}/update permit data
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
