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
  project: PostProjectData;
  objectives: PostObjectivesData;
  location: PostLocationData;
  iucn: PostIUCNData;
  partnerships: PostPartnershipsData;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', message: 'params', obj });

    this.coordinator = (obj?.coordinator && new PostCoordinatorData(obj.coordinator)) || null;
    this.project = (obj?.project && new PostProjectData(obj.project)) || null;
    this.objectives = (obj?.project && new PostObjectivesData(obj.objectives)) || null;
    this.location = (obj?.location && new PostLocationData(obj.location)) || null;
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

/**
 * Processes POST /project project data.
 *
 * @export
 * @class PostProjectData
 */
export class PostProjectData {
  name: string;
  project_programs: number[];
  project_types: number[];
  start_date: string;
  end_date: string;
  comments: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectData', message: 'params', obj });

    this.name = obj?.project_name || null;
    this.project_programs = obj?.project_programs || [];
    this.project_types = obj?.project_types || [];
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

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostObjectivesData', message: 'params', obj });

    this.objectives = obj?.objectives || '';
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

    this.location_description = obj?.location_description;
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

export class PostDraftData {
  name: string;
  data: object;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostDraftData', message: 'params', obj });

    this.name = obj?.name || null;
    this.data = (obj?.data && obj.data) || {};
  }
}
