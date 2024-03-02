import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { URLSearchParams } from 'url';
import { v4 } from 'uuid';
import { z } from 'zod';
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
  taxon_measurement_id: z.string(),
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

  //TODO: DEPRECATED remove + remove tests
  // async filterCritters(data: IFilterCritters, format: 'default' | 'detailed' = 'default') {
  //   const response = await this.axiosInstance.post(`${FILTER_ENDPOINT}?format=${format}`, data);
  //   return response.data;
  // }
  async getMultipleCrittersByIds(critter_ids: string[]) {
    const response = await this.axiosInstance.post(CRITTER_ENDPOINT, { critter_ids });
    return response.data;
  }

  async signUp() {
    const response = await this.axiosInstance.post(SIGNUP_ENDPOINT);
    return response.data;
  }

  /**
   * Get measurement values for a given set of event ids.
   *
   * @param {string[]} eventIds
   * @return {*}  {Promise<CBMeasurementValue[]>}
   * @memberof CritterbaseService
   */
  async getMeasurementValuesForEventIds(eventIds: string[]): Promise<CBMeasurementValue[]> {
    // TODO: wire up to critter base api when available
    // const response = await this.axiosInstance.post('', ids);F
    const mockMeasurements = (eventId: string) => [
      {
        event_id: eventId,
        measurement_quantitative_id: 'b73097cd-06bc-4fb3-9f69-ed471abc6a94',
        taxon_measurement_id: 'c38c3d61-833f-47d4-a173-6a01a19a7a13',
        value: 5,
        measurement_comment: 'This is a comment about the measurement.',
        measured_timestamp: ''
      },
      {
        event_id: eventId,
        measurement_qualitative_id: 'd78991d8-806f-4b4c-802c-aaadbf21c381',
        taxon_measurement_id: 'd47568e6-e7ef-49fd-bbac-7e4ad47418be',
        qualitative_option_id: '2272abee-8161-4887-a5e4-b842524e48c8',
        measurement_comment: 'This is a comment about the measurement.',
        measured_timestamp: ''
      }
    ];

    return eventIds.flatMap((eventId) => mockMeasurements(eventId));
  }

  /**
   * Get measurement type definitions for a given set of event ids.
   *
   * @param {string[]} eventIds
   * @return {*}  {Promise<CBMeasurementType[]>}
   * @memberof CritterbaseService
   */
  async getMeasurementTypeDefinitionsForEventIds(eventIds: string[]): Promise<CBMeasurementType[]> {
    // TODO: wire up to critter base api when available
    // const response = await this.axiosInstance.post('', ids);
    return [
      {
        itis_tsn: 123,
        taxon_measurement_id: 'c38c3d61-833f-47d4-a173-6a01a19a7a13',
        measurement_name: 'Estimated age',
        measurement_desc: 'Estimated age of the animal in years',
        max_value: 100,
        min_value: 0,
        unit: null
      },
      {
        itis_tsn: 456,
        taxon_measurement_id: 'd47568e6-e7ef-49fd-bbac-7e4ad47418be',
        measurement_name: 'Juvenile at heel indicator',
        measurement_desc: 'Indicator of juvenile at heel',
        options: [
          {
            qualitative_option_id: '824900f6-f2bd-4a24-b844-3bf54d82a667',
            taxon_measurement_id: 'd47568e6-e7ef-49fd-bbac-7e4ad47418be',
            option_label: 'False',
            option_value: 0,
            option_desc: null
          },
          {
            qualitative_option_id: '2272abee-8161-4887-a5e4-b842524e48c8',
            taxon_measurement_id: 'd47568e6-e7ef-49fd-bbac-7e4ad47418be',
            option_label: 'True',
            option_value: 1,
            option_desc: null
          }
        ]
      }
    ];
  }

  /**
   * Search for measurement type definitions by keywords.
   *
   * @param {string[]} searchTerms
   * @return {*}  {Promise<CBMeasurementType[]>}
   * @memberof CritterbaseService
   */
  async searchForMeasurementTypeDefinitions(searchTerms: string[]): Promise<CBMeasurementType[]> {
    // TODO: wire up to critter base api when available
    // const response = await this.axiosInstance.post('', ids);
    return [
      {
        itis_tsn: 123,
        taxon_measurement_id: 'c38c3d61-833f-47d4-a173-6a01a19a7a13',
        measurement_name: 'Estimated age',
        measurement_desc: 'Estimated age of the animal in years',
        max_value: null,
        min_value: 0,
        unit: null
      },
      {
        itis_tsn: 123,
        taxon_measurement_id: '9b58e2bd-a5b1-4217-b41e-16112003e7e6',
        measurement_name: 'Juvenile count',
        measurement_desc: 'Number of juveniles',
        max_value: null,
        min_value: 0,
        unit: null
      },
      {
        itis_tsn: 123,
        taxon_measurement_id: 'b0712ca0-74b3-42df-9c42-7066e6713518',
        measurement_name: 'Life Stage',
        measurement_desc: 'Life stage of the animal',
        options: []
      },
      {
        itis_tsn: 456,
        taxon_measurement_id: '1e1fccd9-9d35-41f8-abd0-408d41e9ba33',
        measurement_name: 'Life Stage',
        measurement_desc: 'Life stage of the animal',
        options: []
      },
      {
        itis_tsn: 456,
        taxon_measurement_id: 'd47568e6-e7ef-49fd-bbac-7e4ad47418be',
        measurement_name: 'Juvenile at heel indicator',
        measurement_desc: 'Indicator of juvenile at heel',
        options: [
          {
            qualitative_option_id: '824900f6-f2bd-4a24-b844-3bf54d82a667',
            taxon_measurement_id: 'd47568e6-e7ef-49fd-bbac-7e4ad47418be',
            option_label: 'False',
            option_value: 0,
            option_desc: null
          },
          {
            qualitative_option_id: '2272abee-8161-4887-a5e4-b842524e48c8',
            taxon_measurement_id: 'd47568e6-e7ef-49fd-bbac-7e4ad47418be',
            option_label: 'True',
            option_value: 1,
            option_desc: null
          }
        ]
      }
    ];
  }

  /**
   * Insert measurement records.
   *
   * TODO: Implement this function fully when Critterbase changes are complete.
   *
   * @param {any[]} measurements
   * @return {*}  {Promise<{ eventId: string }>}
   * @memberof CritterbaseService
   */
  async insertMeasurementRecords(measurements: any[]): Promise<{ eventId: string }> {
    // const response = await this.axiosInstance.post('', ids);
    return { eventId: v4().toString() };
  }
}
