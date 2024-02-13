import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { URLSearchParams } from 'url';
import { v4 } from 'uuid';
import { ApiError, ApiErrorType } from '../errors/api-error';
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

export interface ICollection {
  critter_collection_unit?: string;
  critter_id: string;
  collection_unit_id: string;
}

export interface IBulkCreate {
  critters: ICritter[];
  captures: ICapture[];
  collections: ICollection[];
  mortalities: IMortality[];
  locations: ILocation[];
  markings: IMarking[];
  quantitative_measurements: IQuantMeasurement[];
  qualitative_measurements: IQualMeasurement[];
  families: IFamilyPayload[];
}

interface IFilterObj {
  body: string[];
  negate: boolean;
}

export interface IFilterCritters {
  critter_ids?: IFilterObj;
  animal_ids?: IFilterObj;
  wlh_ids?: IFilterObj;
  collection_units?: IFilterObj;
  taxon_name_commons?: IFilterObj;
}

export interface ICbSelectRows {
  key: string;
  id: string;
  value: string;
}

export interface ICBQuantitativeMeasurement {
  itis_tsn: number | null;
  taxon_measurement_id: string;
  measurement_name: string;
  measurement_desc: string | null;
  min_value: number | null;
  max_value: number | null;
  unit: CBMeasurementUnit | null;
}

export interface ICBQualitativeMeasurement {
  itis_tsn: number | null;
  taxon_measurement_id: string;
  measurement_name: string;
  measurement_desc: string | null;
  options: ICBQualitativeOption[];
}

export enum CBMeasurementUnit {
  millimeter = 'millimeter',
  centimeter = 'centimeter',
  meter = 'meter',
  milligram = 'milligram',
  gram = 'gram',
  kilogram = 'kilogram'
}

export interface ICBQualitativeOption {
  taxon_measurement_id: string;
  qualitative_option_id: string;
  option_label: string | null;
  option_value: number;
  option_desc: string | null;
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

export type CbRouteKey = keyof typeof CbRoutes;

export const CRITTERBASE_API_HOST = process.env.CB_API_HOST || ``;
const CRITTER_ENDPOINT = '/critters';
const FILTER_ENDPOINT = `${CRITTER_ENDPOINT}/filter`;
const BULK_ENDPOINT = '/bulk';
const SIGNUP_ENDPOINT = '/signup';
const FAMILY_ENDPOINT = '/family';

export class CritterbaseService {
  user: ICritterbaseUser;
  keycloak: KeycloakService;
  axiosInstance: AxiosInstance;

  constructor(user: ICritterbaseUser) {
    this.user = user;
    this.keycloak = new KeycloakService();
    this.axiosInstance = axios.create({
      headers: {
        user: this.getUserHeader()
      },
      baseURL: CRITTERBASE_API_HOST
    });

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        return Promise.reject(
          new ApiError(ApiErrorType.UNKNOWN, `API request failed with status code ${error?.response?.status}`)
        );
      }
    );

    // Async request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        config.headers['Authorization'] = `Bearer ${token}`;

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async getToken(): Promise<string> {
    const token = await this.keycloak.getKeycloakServiceToken();
    return token;
  }

  /**
   * Return user information as a JSON string.
   *
   * @return {*}  {string}
   * @memberof BctwService
   */
  getUserHeader(): string {
    return JSON.stringify(this.user);
  }

  async _makeGetRequest(endpoint: string, params: QueryParam[]) {
    const appendParams = new URLSearchParams();
    for (const p of params) {
      appendParams.append(p.key, p.value);
    }
    const url = `${endpoint}?${appendParams.toString()}`;
    const response = await this.axiosInstance.get(url);
    return response.data;
  }

  async getLookupValues(route: CbRouteKey, params: QueryParam[]) {
    return this._makeGetRequest(CbRoutes[route], params);
  }

  async getTaxonMeasurements(taxon_id: string) {
    return this._makeGetRequest(CbRoutes['taxon-measurements'], [{ key: 'taxon_id', value: taxon_id }]);
  }

  async getTaxonBodyLocations(taxon_id: string) {
    return this._makeGetRequest(CbRoutes['taxon-marking-body-locations'], [
      { key: 'taxon_id', value: taxon_id },
      { key: 'format', value: 'asSelect' }
    ]);
  }

  async getQualitativeOptions(taxon_measurement_id: string, format = 'asSelect') {
    return this._makeGetRequest(CbRoutes['taxon-qualitative-measurement-options'], [
      { key: 'taxon_measurement_id', value: taxon_measurement_id },
      { key: 'format', value: format }
    ]);
  }

  async getFamilies() {
    return this._makeGetRequest(FAMILY_ENDPOINT, []);
  }

  async getFamilyById(family_id: string) {
    return this._makeGetRequest(`${FAMILY_ENDPOINT}/${family_id}`, []);
  }

  async getCritter(critter_id: string) {
    return this._makeGetRequest(`${CRITTER_ENDPOINT}/${critter_id}`, [{ key: 'format', value: 'detail' }]);
  }

  async createCritter(data: IBulkCreate) {
    const response = await this.axiosInstance.post(BULK_ENDPOINT, data);
    return response.data;
  }

  async updateCritter(data: IBulkCreate) {
    const response = await this.axiosInstance.patch(BULK_ENDPOINT, data);
    return response.data;
  }

  async filterCritters(data: IFilterCritters, format: 'default' | 'detailed' = 'default') {
    const response = await this.axiosInstance.post(`${FILTER_ENDPOINT}?format=${format}`, data);
    return response.data;
  }

  async signUp() {
    const response = await this.axiosInstance.post(SIGNUP_ENDPOINT);
    return response.data;
  }

  async getMeasurements(): Promise<{
    qualitative: ICBQualitativeMeasurement[];
    quantitative: ICBQuantitativeMeasurement[];
  }> {
    // const response = await this.axiosInstance.post(`measurements`);
    return { qualitative: [], quantitative: [] };
  }

  async getMeasurementsForEventIds(ids: (string | null)[]): Promise<any> {
    // TODO: wire up to critter base api when available
    // const response = await this.axiosInstance.post('', ids);
    return [
      { id: v4().toString(), name: 'Wingspan', type: 'string' },
      { id: v4().toString(), name: 'Fur color', type: 'string' },
      { id: v4().toString(), name: 'Antlers', type: 'number' }
    ];
  }

  async searchForMeasurements(search: string): Promise<any> {
    // TODO: wire up to critter base api when available
    // const response = await this.axiosInstance.post('', ids);
    return [
      { id: v4().toString(), name: 'Wingspan', type: 'string' },
      { id: v4().toString(), name: 'Fur color', type: 'string' },
      { id: v4().toString(), name: 'Antlers', type: 'number' }
    ];
  }

  async addAttributeRecords(measurements: any[]): Promise<string> {
    // const response = await this.axiosInstance.post('', ids);
    return v4().toString();
  }
}
