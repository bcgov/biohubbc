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

export interface ICbSelectRows {
  key: string;
  id: string;
  value: string;
}

const lookups = '/lookups';
const xref = '/xref';
const lookupsEnum = lookups + '/enum';
const lookupsTaxons = lookups + '/taxons';
export const CbRoutes = {
  // lookups
  ['region-envs']: `${lookups}/region-envs`,
  ['region_nrs']: `${lookups}/region-nrs`,
  wmus: `${lookups}/wmus`,
  cods: `${lookups}/cods`,
  ['marking-materials']: `${lookups}/marking-materials`,
  ['marking-types']: `${lookups}/marking-types`,
  ['collection-categories']: `${lookups}/collection-unit-categories`,
  taxons: lookupsTaxons,
  species: `${lookupsTaxons}/species`,
  colours: `${lookups}/colours`,

  // lookups/enum
  sex: `${lookupsEnum}/sex`,
  ['critter-status']: `${lookupsEnum}/critter-status`,
  ['cause-of-death-confidence']: `${lookupsEnum}/cod-confidence`,
  ['coordinate-uncertainty-unit']: `${lookupsEnum}/coordinate-uncertainty-unit`,
  ['frequency-units']: `${lookupsEnum}/frequency-units`,
  ['measurement-units']: `${lookupsEnum}/measurement-units`,

  // xref
  ['collection-units']: `${xref}/collection-units`,

  // taxon xrefs
  ['taxon-measurements']: `${xref}/taxon-measurements`,
  ['taxon_qualitative_measurements']: `${xref}/taxon-qualitative-measurements`,
  ['taxon-qualitative-measurement-options']: `${xref}/taxon-qualitative-measurement-options`,
  ['taxon-quantitative-measurements']: `${xref}/taxon-quantitative-measurements`,
  ['taxon-collection-categories']: `${xref}/taxon-collection-categories`,
  ['taxon-marking-body-locations']: `${xref}/taxon-marking-body-locations`
} as const;

export type ICbRouteKey = keyof typeof CbRoutes;

const CRITTERBASE_API_HOST = process.env.CB_API_HOST || ``;
const CRITTER_ENDPOINT = '/critters/';
const BULK_ENDPOINT = '/bulk';
const SIGNUP_ENDPOINT = '/signup';
const FAMILY_ENDPOINT = '/family';

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

  getUserHeader(): { user: string } {
    return { user: JSON.stringify(this.user) };
  }

  async makeGetRequest(endpoint: string, params: QueryParam[]) {
    let url = `${CRITTERBASE_API_HOST}${endpoint}`;
    for (let i = 0; i < params.length; i++) {
      url += (i === 0 ? '?' : '&') + params[i].key + '=' + params[i].value;
    }
    console.log('Actual URL we will hit ' + url);
    const token = await this.getToken();
    const response = await axios.get(url, {
      headers: {
        authorization: `Bearer ${token}`,
        ...this.getUserHeader()
      }
    });
    return response.data;
  }

  async makePostPatchRequest(method: 'post' | 'patch', endpoint: string, data?: any) {
    const url = `${CRITTERBASE_API_HOST}${endpoint}`;
    const token = await this.getToken();
    const response = await axios[method](url, data, {
      headers: {
        authorization: `Bearer ${token}`,
        ...this.getUserHeader()
      }
    });
    return response.data;
  }

  async getLookupValues(route: ICbRouteKey, params: QueryParam[]) {
    return this.makeGetRequest(`${CbRoutes[route]}`, params);
  }

  async getTaxonMeasurements(taxon_id: string) {
    return this.makeGetRequest(`${CbRoutes['taxon-measurements']}`, [{ key: 'taxon_id', value: taxon_id }]);
  }

  async getTaxonBodyLocations(taxon_id: string) {
    return this.makeGetRequest(`${CbRoutes['taxon-marking-body-locations']}`, [
      { key: 'taxon_id', value: taxon_id },
      { key: 'format', value: 'asSelect' }
    ]);
  }

  async getQualitativeOptions(taxon_measurement_id: string, format = 'asSelect') {
    return this.makeGetRequest(`${CbRoutes['taxon-qualitative-measurement-options']}`, [
      { key: 'taxon_measurement_id', value: taxon_measurement_id },
      { key: 'format', value: format }
    ]);
  }

  async getFamilies() {
    return this.makeGetRequest(FAMILY_ENDPOINT, []);
  }

  async getFamilyById(family_id: string) {
    return this.makeGetRequest(`${FAMILY_ENDPOINT}/${family_id}`, []);
  }

  async getCritter(critter_id: string) {
    return this.makeGetRequest(CRITTER_ENDPOINT + critter_id, [{ key: 'format', value: 'detail' }]);
  }

  async createCritter(data: IBulkCreate) {
    return this.makePostPatchRequest('post', BULK_ENDPOINT, data);
  }

  async signUp() {
    return this.makePostPatchRequest('post', SIGNUP_ENDPOINT);
  }
}
