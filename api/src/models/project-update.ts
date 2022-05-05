import { Feature } from 'geojson';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-update');

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

export interface IPutIUCN {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

export class PutIUCNData {
  classificationDetails: IPutIUCN[];

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

export class PutPartnershipsData {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutPartnershipsData', message: 'params', obj });

    this.indigenous_partnerships = (obj?.indigenous_partnerships?.length && obj.indigenous_partnerships) || [];
    this.stakeholder_partnerships = (obj?.stakeholder_partnerships?.length && obj.stakeholder_partnerships) || [];
  }
}
