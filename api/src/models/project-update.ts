import { Feature } from 'geojson';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-update');

export class PutProjectData {
  name: string;
  type: number;
  start_date: string;
  end_date: string;
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutProjectData', message: 'params', obj });

    this.name = obj?.project_name || null;
    this.type = obj?.project_type || null;
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
    defaultLog.debug({ label: 'PutLocationData', message: 'params', obj });

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
    this.caveats = obj?.caveats || null;
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
