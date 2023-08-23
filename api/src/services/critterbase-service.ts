import axios from 'axios';
import { KeycloakService } from './keycloak-service';

export interface ICritterbaseUser {
  username: string;
  keycloak_guid: string;
}

export interface QueryParam {
  key: string;
  value: string;
}

export interface ICritter {
  critter_id?: string;
  wlh_id: string;
  animal_id: string;
  sex: string;
  critter_comment: string;
}

export interface ICapture {
  capture_id?: string;
  critter_id: string;
  capture_location_id: string;
  release_location_id: string;
  capture_timestamp: string;
  release_timestamp: string;
  capture_comment: string;
  release_comment: string;
}

export interface IMortality {
  mortality_id?: string;
  critter_id: string;
  location_id: string;
  mortality_timestamp: string;
  proximate_cause_of_death_id: string;
  proximate_cause_of_death_confidence: string;
  proximate_predated_by_taxon_id: string;
  ultimate_cause_of_death_id: string;
  ultimate_cause_of_death_confidence: string;
  ultimate_predated_by_taxon_id: string;
  mortality_comment: string;
}

export interface ILocation {
  location_id?: string;
  latitude: number;
  longitude: number;
}

export interface IMarking {
  marking_id?: string;
  critter_id: string;
  capture_id: string; 
  mortality_id: string;
  taxon_marking_body_location_id: string;
  marking_type_id: string;
  marking_material_id: string;
  primary_colour_id: string;
  secondary_colour_id: string;
  text_colour_id: string;
  identifier: string;
  frequency: number;
  frequency_unit: string;
  order: number;
  comment: string;
  attached_timestamp: string;
  removed_timestamp: string;
}

export interface IQualMeasurement {
  measurement_qualitative_id?: string;
  critter_id: string;
  taxon_measurement_id: string;
  capture_id?: string;
  mortality_id?: string;
  qualitative_option_id: string;
  measurement_comment: string;
  measured_timestamp: string;
}

export interface IQuantMeasurement {
  measurement_quantitative_id?: string;
  taxon_measurement_id: string;
  capture_id?: string;
  mortality_id?: string;
  value: number;
  measurement_comment?: string;
  measured_timestamp?: string;
}

export interface IFamilyPayload {
  families: { family_id: string; family_label: string }[];
  parents: { family_id: string; parent_critter_id: string }[];
  children: { family_id: string; child_critter_id: string }[];
}

export interface IBulkCreate {
  critters: ICritter[];
  captures: ICapture[];
  mortality: IMortality[];
  locations: ILocation[];
  markings: IMarking[];
  measurement_quantitative: IQuantMeasurement[];
  measurement_qualitative: IQualMeasurement[];
  family: IFamilyPayload[];
}

const CRITTERBASE_API_HOST = process.env.CB_API_HOST || ``;
const CRITTER_ENDPOINT = '/critters/';
const BULK_ENDPOINT = '/bulk';

export class CritterbaseService {
  user: ICritterbaseUser;
  keycloak: KeycloakService;

  constructor(user: ICritterbaseUser) {
    this.user = user;
    this.keycloak = new KeycloakService();
  }

  async getToken(): Promise<string> {
    const token = await this.keycloak.getKeycloakServiceToken();
    return token;
  }

  async makeGetRequest(endpoint: string, params: QueryParam[]) {
    let url = `${CRITTERBASE_API_HOST}${endpoint}`;
    for (let i = 0; i < params.length; i++) {
      url += (i === 0 ? '?' : '&') + params[i].key + '=' + params[i].value;
    }
    const token = await this.getToken();
    const response = await axios.get(url, {
      headers: {
        authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }

  async makePostPatchRequest(method: 'post' | 'patch', endpoint: string, data?: any) {
    const url = `${CRITTERBASE_API_HOST}${endpoint}`;
    const token = await this.getToken();
    const response = await axios[method](url, data, {
      headers: {
        authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }

  async getCritter(critter_id: string) {
    return this.makeGetRequest(CRITTER_ENDPOINT + critter_id, [{ key: 'format', value: 'detail' }]);
  }

  async createCritter(data: IBulkCreate) {
    return this.makePostPatchRequest('post', BULK_ENDPOINT, data);
  }
}
