import { Feature } from 'geojson';
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
  climate_change_initiatives: number[];
  start_date: string;
  end_date: string;
  comments: string;

  constructor(projectData?: any, activityData?: any[], climateInitiativeData?: any[]) {
    defaultLog.debug({ label: 'GetProjectData', message: 'params', projectData, activityData, climateInitiativeData });

    this.project_name = projectData?.name || '';
    this.project_type = projectData?.type || '';
    this.project_activities = (activityData?.length && activityData.map((item) => item.a_id)) || [];
    this.climate_change_initiatives =
      (climateInitiativeData?.length && climateInitiativeData.map((item) => item.cci_id)) || [];
    this.start_date = projectData?.start_date || '';
    this.end_date = projectData?.end_date || '';
    this.comments = projectData?.comments || '';
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
  regions: string[];
  geometry?: Feature[];

  constructor(locationData?: any) {
    defaultLog.debug({
      label: 'GetLocationData',
      message: 'params',
      locationData
    });

    const locationDataItem = locationData && locationData.length && locationData[0];

    this.location_description = locationDataItem?.location_description || '';
    this.regions =
      (locationData &&
        locationData.map((item: any) => {
          return item.name;
        })) ||
      [];
    this.geometry = (locationDataItem?.geometry?.length && [JSON.parse(locationDataItem.geometry)]) || [];
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

  constructor(obj?: any) {
    defaultLog.debug({ label: 'GetObjectivesData', message: 'params', obj });

    this.objectives = obj?.objectives || '';
    this.caveats = obj?.caveats || '';
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

  constructor(obj?: any) {
    defaultLog.debug({ label: 'GetCoordinatorData', message: 'params', obj });

    this.first_name = obj?.coordinator_first_name || '';
    this.last_name = obj?.coordinator_last_name || '';
    this.email_address = obj?.coordinator_email_address || '';
    this.coordinator_agency = obj?.coordinator_agency_name || '';
    this.share_contact_details = obj?.coordinator_public ? 'true' : 'false';
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

interface IGetFundingSource {
  agency_id: string;
  investment_action_category: string;
  agency_name: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
}

/**
 * Pre-processes GET /projects/{id} funding data
 *
 * @export
 * @class GetFundingData
 */
export class GetFundingData {
  fundingAgencies: IGetFundingSource[];

  constructor(fundingData?: any[]) {
    defaultLog.debug({
      label: 'GetFundingData',
      message: 'params',
      fundingData: fundingData
    });

    this.fundingAgencies =
      (fundingData &&
        fundingData.map((item: any) => {
          return {
            agency_id: item.agency_id,
            investment_action_category: item.investment_action_category,
            agency_name: item.agency_name,
            funding_amount: item.funding_amount,
            start_date: item.start_date,
            end_date: item.end_date
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
      (indigenous_partnerships?.length && indigenous_partnerships.map((item: any) => item.name)) || [];
    this.stakeholder_partnerships =
      (stakeholder_partnerships?.length && stakeholder_partnerships.map((item: any) => item.name)) || [];
  }
}
