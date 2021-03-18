import { Feature } from 'geojson';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project');

/**
 * An interface representing the project table.
 *
 * @export
 * @interface IProject
 */
export interface IProject {
  id: number;
  pt_id: number;
  name: string;
  objectives: string;
  location_description: string;
  start_date: string;
  end_date: string;
  caveats: string;
  comments: string;
  coordinator_first_name: string;
  coordinator_last_name: string;
  coordinator_email_address: string;
  coordinator_agency_name: string;
  geometry: Feature[];
  focal_species_name_list: string;
  regions_name_list?: string;
}

/**
 * An interface representing the project funding agency table.
 *
 * @export
 * @interface IProjectFundingAgency
 */
export interface IProjectFundingAgency {
  id: number;
  funding_agency_project_id: string;
  funding_amount: number;
  funding_start_date: string;
  funding_end_date: string;
}

/**
 * An interface representing the funding agency table.
 *
 * @export
 * @interface IFundingAgency
 */
export interface IFundingAgency {
  id: number;
  name: string;
  record_effective_date: string;
  record_end_date?: string;
}

/**
 * An interface representing the land based investment strategy table.
 *
 * @export
 * @interface ILandBasedInvestmentStrategy
 */
export interface ILandBasedInvestmentStrategy {
  id: number;
  name: string;
}

/**
 * An interface representing the project management actions table.
 *
 * @export
 * @interface IProjectManagementActions
 */
export interface IProjectManagementActions {
  id: number;
}

/**
 * An interface representing the management action type table.
 *
 * @export
 * @interface IManagementActionType
 */
export interface IManagementActionType {
  id: number;
  name: string;
  record_effective_date: string;
  record_end_date?: string;
  description: string;
}

/**
 * An interface representing the project region table.
 *
 * @export
 * @interface IProjectRegion
 */
export interface IProjectRegion {
  id: number;
  region_name: string;
}

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
  species: PostSpeciesData;
  iucn: PostIUCNData;
  funding: PostFundingData;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', message: 'params', obj });

    this.coordinator = (obj?.coordinator && new PostCoordinatorData(obj.coordinator)) || null;
    this.permit = (obj?.permit && new PostPermitData(obj.permit)) || null;
    this.project = (obj?.project && new PostProjectData(obj.project)) || null;
    this.species = (obj?.project && new PostSpeciesData(obj.species)) || null;
    this.objectives = (obj?.project && new PostObjectivesData(obj.objectives)) || null;
    this.location = (obj?.location && new PostLocationData(obj.location)) || null;
    this.funding = (obj?.funding && new PostFundingData(obj.funding)) || null;
    this.iucn = (obj?.iucn && new PostIUCNData(obj.iucn)) || null;
  }
}

/**
 * Processes POST /project coordinator data
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
  sampling_conducted: boolean;
}

/**
 * Processes POST /project permit data
 *
 * @export
 * @class PostPermitData
 */
export class PostPermitData {
  permits: IPostPermit[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostPermitData', message: 'params', obj });

    this.permits =
      (obj?.permits?.length &&
        obj.permits.map((item: any) => {
          return {
            permit_number: item.permit_number,
            sampling_conducted: (item.sampling_conducted === 'true' && true) || false
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
  climate_change_initiatives: number[];
  start_date: string;
  end_date: string;
  comments: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectData', message: 'params', obj });

    this.name = obj?.project_name || null;
    this.type = obj?.project_type || null;
    this.project_activities = (obj?.project_activities?.length && obj.project_activities) || [];
    this.climate_change_initiatives = (obj?.climate_change_initiatives?.length && obj.climate_change_initiatives) || [];
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.comments = obj?.comments || null;
  }
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
  project_type_name: string;
  project_activities: number[];
  climate_change_initiatives: number[];
  start_date: string;
  end_date: string;
  comments: string;

  constructor(projectData?: any, activityData?: any[], climateInitiativeData?: any[]) {
    defaultLog.debug({ label: 'GetProjectData', message: 'params', projectData, activityData, climateInitiativeData });

    this.project_name = projectData?.name || null;
    this.project_type = projectData?.pt_id || null;
    this.project_type_name = projectData?.pt_name || null;
    this.project_activities = (activityData?.length && activityData.map((item) => item.a_id)) || [];
    this.climate_change_initiatives =
      (climateInitiativeData?.length && climateInitiativeData.map((item) => item.cci_id)) || [];
    this.start_date = projectData?.start_date || null;
    this.end_date = projectData?.end_date || null;
    this.comments = projectData?.comments || null;
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
    this.caveats = obj?.caveats || null;
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
    this.caveats = obj?.caveats || null;
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
  share_contact_details: boolean;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'GetCoordinatorData', message: 'params', obj });

    this.first_name = obj?.coordinator_first_name || '';
    this.last_name = obj?.coordinator_last_name || '';
    this.email_address = obj?.coordinator_email_address || '';
    this.coordinator_agency = obj?.coordinator_agency_name || '';
    this.share_contact_details = (obj?.coordinator_public === 'true' && true) || false;
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
  regions: string[];
  geometry: Feature[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostLocationData', message: 'params', obj });

    this.location_description = (obj && obj.location_description) || null;
    this.regions = (obj?.regions?.length && obj.regions) || [];
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
 * Pre-processes GET /projects/{id}
 *
 * @export
 * @class GetLocationData
 */
export class GetLocationData {
  location_description: string;
  regions: string[];
  geometry?: Feature[];

  constructor(projectData?: any, regionsData?: any[]) {
    defaultLog.debug({
      label: 'GetLocationData',
      message: 'params',
      projectData: projectData,
      regionsData: regionsData
    });

    this.location_description = (projectData && projectData.location_description) || null;
    this.regions =
      (regionsData &&
        regionsData.map((item: any) => {
          return item.name;
        })) ||
      [];
    this.geometry = (projectData?.geometry?.length && [JSON.parse(projectData.geometry)]) || [];
  }
}

/**
 * Processes POST /project species data
 *
 * @export
 * @class PostSpeciesData
 */
export class PostSpeciesData {
  focal_species: string[];
  ancillary_species: string[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostSpeciesData', message: 'params', obj });

    this.focal_species = (obj?.focal_species.length && obj?.focal_species) || [];
    this.ancillary_species = (obj?.ancillary_species.length && obj?.ancillary_species) || [];
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
  funding_agencies: PostFundingSource[];
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostFundingData', message: 'params', obj });

    this.funding_agencies =
      (obj?.funding_agencies.length && obj.funding_agencies.map((item: any) => new PostFundingSource(item))) || [];
    this.indigenous_partnerships = (obj?.indigenous_partnerships.length && obj.indigenous_partnerships) || [];
    this.stakeholder_partnerships = (obj?.stakeholder_partnerships.length && obj.stakeholder_partnerships) || [];
  }
}

/**
 * Pre-processes GET /projects/{id} funding data
 *
 * @export
 * @class GetFundingData
 */
export class GetFundingData {
  fundingAgencies: PostFundingSource[];

  constructor(fundingData?: any[]) {
    defaultLog.debug({
      label: 'GetIUCNClassificationData',
      message: 'params',
      fundingData: fundingData
    });

    this.fundingAgencies =
      (fundingData &&
        fundingData.map((item: any) => {
          return {
            agency_id: item.agency_id,
            investment_action_category: item.investment_action_category,
            agency_project_id: item.agency_project_id,
            funding_amount: item.funding_amount,
            start_date: item.start_date,
            end_date: item.end_date
          };
        })) ||
      [];
  }
}
