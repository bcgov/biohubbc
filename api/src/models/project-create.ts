import { Feature } from 'geojson';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-create');

/**
 * Processes all POST /project request data.
 *
 * @export
 * @class PostProjectObject
 */
export class PostProjectObject {
  coordinator: PostCoordinatorData;
  permit: PostPermitData;
  project: PostProjectData;
  objectives: PostObjectivesData;
  location: PostLocationData;
  iucn: PostIUCNData;
  funding: PostFundingData;
  partnerships: PostPartnershipsData;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', message: 'params', obj });

    this.coordinator = (obj?.coordinator && new PostCoordinatorData(obj.coordinator)) || null;
    this.permit = (obj?.permit && new PostPermitData(obj.permit)) || null;
    this.project = (obj?.project && new PostProjectData(obj.project)) || null;
    this.objectives = (obj?.project && new PostObjectivesData(obj.objectives)) || null;
    this.location = (obj?.location && new PostLocationData(obj.location)) || null;
    this.funding = (obj?.funding && new PostFundingData(obj.funding)) || null;
    this.iucn = (obj?.iucn && new PostIUCNData(obj.iucn)) || null;
    this.partnerships = (obj?.partnerships && new PostPartnershipsData(obj.partnerships)) || null;
  }
}

/**
 * Processes POST /project contact data
 *
 * @export
 * @class PostCoordinatorData
 */
export class PostCoordinatorData {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: boolean;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostCoordinatorData', message: 'params', obj });

    this.first_name = obj?.first_name || null;
    this.last_name = obj?.last_name || null;
    this.email_address = obj?.email_address || null;
    this.coordinator_agency = obj?.coordinator_agency || null;
    this.share_contact_details = (obj?.share_contact_details === 'true' && true) || false;
  }
}

export interface IPostPermit {
  permit_number: string;
  permit_type: string;
}

export interface IPostExistingPermit {
  permit_id: number;
}

/**
 * Processes POST /project permit data
 *
 * @export
 * @class PostPermitData
 */
export class PostPermitData {
  permits: IPostPermit[];
  existing_permits: IPostExistingPermit[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostPermitData', message: 'params', obj });

    this.permits =
      (obj?.permits?.length &&
        obj.permits.map((item: any) => {
          return {
            permit_number: item.permit_number,
            permit_type: item.permit_type
          };
        })) ||
      [];

    this.existing_permits =
      (obj?.existing_permits?.length &&
        obj.existing_permits.map((item: any) => {
          return {
            permit_id: item
          };
        })) ||
      [];
  }
}

/**
 * Processes POST /project project data.
 *
 * @export
 * @class PostProjectData
 */
export class PostProjectData {
  name: string;
  type: number;
  project_activities: number[];
  start_date: string;
  end_date: string;
  comments: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectData', message: 'params', obj });

    this.name = obj?.project_name || null;
    this.type = obj?.project_type || null;
    this.project_activities = (obj?.project_activities?.length && obj.project_activities) || [];
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.comments = obj?.comments || null;
  }
}

/**
 * Processes POST /project objectives data
 *
 * @export
 * @class PostObjectivesData
 */
export class PostObjectivesData {
  objectives: string;
  caveats: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostObjectivesData', message: 'params', obj });

    this.objectives = obj?.objectives || '';
    this.caveats = obj?.caveats || '';
  }
}

/**
 * Processes POST /project location data
 *
 * @export
 * @class PostLocationData
 */
export class PostLocationData {
  location_description: string;
  geometry: Feature[];

  constructor(obj?: any) {
    defaultLog.debug({
      label: 'PostLocationData',
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
  }
}

export interface IPostIUCN {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

/**
 * Processes POST /project IUCN data
 *
 * @export
 * @class PostIUCNData
 */
export class PostIUCNData {
  classificationDetails: IPostIUCN[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostIUCNData', message: 'params', obj });

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

/**
 * A single project funding agency.
 *
 * @See PostFundingData
 *
 * @export
 * @class PostFundingSource
 */
export class PostFundingSource {
  agency_id: number;
  investment_action_category: number;
  agency_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostFundingSource', message: 'params', obj });

    this.agency_id = obj?.agency_id || null;
    this.investment_action_category = obj?.investment_action_category || null;
    this.agency_project_id = obj?.agency_project_id || null;
    this.funding_amount = obj?.funding_amount || null;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
  }
}

/**
 * Processes POST /project funding data
 *
 * @export
 * @class PostFundingData
 */
export class PostFundingData {
  funding_sources: PostFundingSource[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostFundingData', message: 'params', obj });

    this.funding_sources =
      (obj?.funding_sources?.length && obj.funding_sources.map((item: any) => new PostFundingSource(item))) || [];
  }
}

/**
 * Processes POST /project partnerships data
 *
 * @export
 * @class PostPartnershipsData
 */
export class PostPartnershipsData {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostPartnershipsData', message: 'params', obj });

    this.indigenous_partnerships = (obj?.indigenous_partnerships.length && obj.indigenous_partnerships) || [];
    this.stakeholder_partnerships = (obj?.stakeholder_partnerships.length && obj.stakeholder_partnerships) || [];
  }
}
