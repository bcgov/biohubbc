import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { URLSearchParams } from 'url';
import { z } from 'zod';
import { ApiError, ApiErrorType } from '../errors/api-error';
import { getLogger } from '../utils/logger';
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
  critter_id: string;
  wlh_id: string | null;
  animal_id: string | null;
  sex: string;
  itis_tsn: number;
  itis_scientific_name: string;
  critter_comment: string | null;
}

export interface ICreateCritter {
  critter_id?: string;
  wlh_id?: string | null;
  animal_id: string; // NOTE: In critterbase this is optional. For SIMS it should be required.
  sex: string;
  itis_tsn: number;
  critter_comment?: string | null;
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
  proximate_predated_by_itis_tsn: string;
  ultimate_cause_of_death_id: string;
  ultimate_cause_of_death_confidence: string;
  ultimate_predated_by_itis_tsn: string;
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
  critters?: ICreateCritter[];
  captures?: ICapture[];
  collections?: ICollection[];
  mortalities?: IMortality[];
  locations?: ILocation[];
  markings?: IMarking[];
  quantitative_measurements?: IQuantMeasurement[];
  qualitative_measurements?: IQualMeasurement[];
  families?: IFamilyPayload[];
}

interface IBulkResponse {
  critters: number;
  captures: number;
  collections: number;
  mortalities: number;
  locations: number;
  markings: number;
  quantitative_measurements: number;
  qualitative_measurements: number;
  families: number;
  family_parents: number;
  family_chidren: number;
}

export interface IBulkCreateResponse {
  created: IBulkResponse;
}

/**
 * A Critterbase quantitative measurement.
 */
export const CBQuantitativeMeasurement = z.object({
  event_id: z.string(),
  measurement_quantitative_id: z.string(),
  taxon_measurement_id: z.string(),
  value: z.number(),
  measurement_comment: z.string(),
  measured_timestamp: z.string()
});

export type CBQuantitativeMeasurement = z.infer<typeof CBQuantitativeMeasurement>;

/**
 * A Critterbase qualitative measurement value.
 */
const CBQualitativeMeasurement = z.object({
  event_id: z.string(),
  measurement_qualitative_id: z.string(),
  taxon_measurement_id: z.string(),
  qualitative_option_id: z.string(),
  measurement_comment: z.string(),
  measured_timestamp: z.string()
});

export type CBQualitativeMeasurement = z.infer<typeof CBQualitativeMeasurement>;

/**
 * Any Critterbase measurement value.
 */
export const CBMeasurementValue = z.union([CBQuantitativeMeasurement, CBQualitativeMeasurement]);

export type CBMeasurementValue = z.infer<typeof CBMeasurementValue>;

/**
 * A Critterbase qualitative measurement unit.
 */
export const CBMeasurementUnit = z.enum(['millimeter', 'centimeter', 'meter', 'milligram', 'gram', 'kilogram']);

export type CBMeasurementUnit = z.infer<typeof CBMeasurementUnit>;

/**
 * A Critterbase quantitative measurement type definition.
 */
const CBQuantitativeMeasurementTypeDefinition = z.object({
  itis_tsn: z.number().nullable(),
  taxon_measurement_id: z.string(),
  measurement_name: z.string(),
  measurement_desc: z.string().nullable(),
  min_value: z.number().nullable(),
  max_value: z.number().nullable(),
  unit: CBMeasurementUnit.nullable()
});

export type CBQuantitativeMeasurementTypeDefinition = z.infer<typeof CBQuantitativeMeasurementTypeDefinition>;

/**
 * A Critterbase qualitative measurement option definition (ie. drop-down option).
 */
const CBQualitativeOption = z.object({
  qualitative_option_id: z.string(),
  option_label: z.string(),
  option_value: z.number(),
  option_desc: z.string().nullable()
});

export type CBQualitativeOption = z.infer<typeof CBQualitativeOption>;

/**
 * A Critterbase qualitative measurement type definition.
 */
const CBQualitativeMeasurementTypeDefinition = z.object({
  itis_tsn: z.number().nullable(),
  taxon_measurement_id: z.string(),
  measurement_name: z.string(),
  measurement_desc: z.string().nullable(),
  options: z.array(CBQualitativeOption)
});

export type CBQualitativeMeasurementTypeDefinition = z.infer<typeof CBQualitativeMeasurementTypeDefinition>;

/**
 * Any Critterbase measurement type definition.
 */
export const CBMeasurementType = z.union([
  CBQuantitativeMeasurementTypeDefinition,
  CBQualitativeMeasurementTypeDefinition
]);

export type CBMeasurementType = z.infer<typeof CBMeasurementType>;

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
const BULK_ENDPOINT = '/bulk';
const SIGNUP_ENDPOINT = '/signup';
const FAMILY_ENDPOINT = '/family';

const defaultLog = getLogger('CritterbaseServiceLogger');

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
        defaultLog.error({ label: 'CritterbaseService', message: error.message, error });
        return Promise.reject(
          new ApiError(ApiErrorType.GENERAL, `API request failed with status code ${error?.response?.status}`)
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

  async getTaxonMeasurements(tsn: string): Promise<{
    qualitative: CBQualitativeMeasurementTypeDefinition[];
    quantitative: CBQuantitativeMeasurementTypeDefinition[];
  }> {
    const response = await this._makeGetRequest(CbRoutes['taxon-measurements'], [{ key: 'tsn', value: tsn }]);
    return response;
  }

  async getTaxonBodyLocations(tsn: string) {
    return this._makeGetRequest(CbRoutes['taxon-marking-body-locations'], [
      { key: 'tsn', value: tsn },
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

  async createCritter(data: ICreateCritter) {
    const response = await this.axiosInstance.post(`${CRITTER_ENDPOINT}/create`, data);
    return response.data;
  }

  async updateCritter(data: IBulkCreate) {
    const response = await this.axiosInstance.patch(BULK_ENDPOINT, data);
    return response.data;
  }

  async bulkCreate(data: IBulkCreate): Promise<IBulkCreateResponse> {
    const response = await this.axiosInstance.post(BULK_ENDPOINT, data);
    return response.data;
  }

  async getMultipleCrittersByIds(critter_ids: string[]): Promise<ICritter[]> {
    const response = await this.axiosInstance.post(CRITTER_ENDPOINT, { critter_ids });
    return response.data;
  }

  async signUp() {
    const response = await this.axiosInstance.post(SIGNUP_ENDPOINT);
    return response.data;
  }

  /**
   * Get qualitative measurement type definitions by Critterbase taxon measurement ids.
   *
   * @param {string[]} taxon_measurement_ids
   * @return {*}  {CBQualitativeMeasurementTypeDefinition[]}
   * @memberof CritterbaseService
   */
  async getQualitativeMeasurementTypeDefinition(
    taxon_measurement_ids: string[]
  ): Promise<CBQualitativeMeasurementTypeDefinition[]> {
    const { data } = await this.axiosInstance.post(`/xref/taxon-qualitative-measurements`, {
      taxon_measurement_ids: taxon_measurement_ids
    });

    return data;
  }

  /**
   * Get qualitative measurement type definitions by Critterbase taxon measurement ids.
   *
   * @param {string[]} taxon_measurement_ids
   * @return {*}  {CBQuantitativeMeasurementTypeDefinition[]}
   * @memberof CritterbaseService
   */
  async getQuantitativeMeasurementTypeDefinition(
    taxon_measurement_ids: string[]
  ): Promise<CBQuantitativeMeasurementTypeDefinition[]> {
    const { data } = await this.axiosInstance.post(`/xref/taxon-quantitative-measurements`, {
      taxon_measurement_ids: taxon_measurement_ids
    });

    return data;
  }

  /**
   * Get collection categories by tsn. Includes hierarchies.
   *
   * @async
   * @param {string} tsn - ITIS TSN
   * @returns {Promise<>} Collection categories
   */
  async getTaxonCollectionCategories(tsn: string) {
    const { data } = await this._makeGetRequest(CbRoutes['taxon-collection-categories'], [{ key: 'tsn', value: tsn }]);

    return data;
  }
}
