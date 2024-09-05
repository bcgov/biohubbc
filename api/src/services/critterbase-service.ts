import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { Request } from 'express';
import qs from 'qs';
import { z } from 'zod';
import { ApiError, ApiErrorType } from '../errors/api-error';
import { getLogger } from '../utils/logger';
import { KeycloakService } from './keycloak-service';

// TODO: TechDebt: Audit the existing types / return types in this file.

export interface ICritterbaseUser {
  username: string;
  keycloak_guid: string;
}

export const getCritterbaseUser = (req: Request): ICritterbaseUser => ({
  keycloak_guid: req.system_user?.user_guid ?? '',
  username: req.system_user?.user_identifier ?? ''
});

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

export interface ICritterDetailed extends ICritter {
  captures: ICaptureDetailed[];
  mortality: IMortality;
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
  capture_method_id?: string | null;
  capture_location_id: string;
  release_location_id?: string | null;
  capture_date: string;
  capture_time?: string | null;
  release_date?: string | null;
  release_time?: string | null;
  capture_comment?: string | null;
  release_comment?: string | null;
}

export interface ICaptureDetailed {
  capture_id: string;
  critter_id: string;
  capture_method_id?: string | null;
  capture_location_id?: string | null;
  release_location_id?: string | null;
  capture_date: string;
  capture_time?: string | null;
  release_date?: string | null;
  release_time?: string | null;
  capture_comment?: string | null;
  release_comment?: string | null;
  markings: IMarking[];
  quantitative_measurements: IQualMeasurement[];
  qualitative_measurements: IQuantMeasurement[];
  capture_location: {
    latitude: number;
    longitude: number;
  };
  release_location: {
    latitude: number;
    longitude: number;
  };
}

export interface ICreateCapture {
  critter_id: string;
  capture_method_id?: string;
  capture_location: ILocation;
  release_location?: ILocation;
  capture_date: string;
  capture_time?: string | null;
  release_date?: string | null;
  release_time?: string | null;
  capture_comment?: string | null;
  release_comment?: string | null;
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
  mortality_location: {
    latitude: number;
    longitude: number;
  };
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

/**
 * This is the more flexible interface for bulk importing Markings.
 *
 * Note: Critterbase bulk-create endpoint will attempt to patch
 * english values to UUID's.
 * ie: primary_colour: "red" -> primary_colour_id: <uuid>
 *
 */
export interface IBulkCreateMarking {
  marking_id?: string;
  critter_id: string;
  capture_id?: string | null;
  mortality_id?: string | null;
  body_location: string; // Critterbase will patch to UUID
  marking_type?: string | null; // Critterbase will patch to UUID
  marking_material_id?: string | null;
  primary_colour?: string | null; // Critterbase will patch to UUID
  secondary_colour?: string | null; // Critterbase will patch to UUID
  text_colour_id?: string | null;
  identifier?: string | null;
  frequency?: number | null;
  frequency_unit?: string | null;
  order?: number | null;
  comment?: string | null;
  attached_timestamp?: string | null;
  removed_timestamp?: string | null;
}

export interface IQualMeasurement {
  measurement_qualitative_id?: string;
  critter_id: string;
  taxon_measurement_id: string;
  capture_id?: string;
  mortality_id?: string;
  qualitative_option_id: string;
  measurement_comment?: string;
  measured_timestamp?: string;
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
  markings?: IMarking[] | IBulkCreateMarking[];
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

export interface ICollectionUnitWithCategory {
  collection_unit_id: string;
  collection_category_id: string;
  category_name: string;
  unit_name: string;
  description: string | null;
}

export interface ICollectionCategory {
  collection_category_id: string;
  category_name: string;
  description: string | null;
  itis_tsn: number;
}

// Lookup value `asSelect` format
export interface IAsSelectLookup {
  id: string;
  key: string;
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

export const CRITTERBASE_API_HOST = process.env.CB_API_HOST || ``;

const defaultLog = getLogger('CritterbaseServiceLogger');

// Response formats
enum CritterbaseFormatEnum {
  DETAILED = 'detailed',
  AS_SELECT = 'asSelect'
}

/**
 * @export
 * @class CritterbaseService
 *
 */
export class CritterbaseService {
  /**
   * User details for Critterbase auditing
   *
   */
  user: ICritterbaseUser;
  /**
   * KeycloakService for retrieving token
   *
   */
  keycloak: KeycloakService;
  /**
   * Critterbase specific axios instance
   *
   */
  axiosInstance: AxiosInstance;

  constructor(user: ICritterbaseUser) {
    this.user = user;
    this.keycloak = new KeycloakService();

    this.axiosInstance = axios.create({
      paramsSerializer: (params) => qs.stringify(params),
      baseURL: CRITTERBASE_API_HOST
    });

    /**
     * Response interceptor
     *
     * Formats Critterbase errors into SIMS format
     */
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        defaultLog.error({ label: 'CritterbaseService', message: error.message, error: error.response?.data });

        return Promise.reject(
          new ApiError(
            ApiErrorType.GENERAL,
            `Critterbase API request failed with status code ${error?.response?.status}`,
            [error.response?.data as object]
          )
        );
      }
    );

    /**
     * Async request interceptor
     *
     * Injects the bearer authentication token and user details into headers
     */
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.keycloak.getKeycloakServiceToken();

        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers.user = JSON.stringify(this.user);

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Fetches Critterbase colour lookup values.
   *
   * @async
   * @returns {Promise<IAsSelectLookup[]>} AsSelect format
   */
  async getColours(): Promise<IAsSelectLookup[]> {
    const response = await this.axiosInstance.get('/lookups/colours', {
      params: { format: CritterbaseFormatEnum.AS_SELECT }
    });

    return response.data;
  }

  /**
   * Fetches Critterbase marking type lookup values.
   *
   * @async
   * @returns {Promise<IAsSelectLookup[]>} AsSelect format
   */
  async getMarkingTypes(): Promise<IAsSelectLookup[]> {
    const response = await this.axiosInstance.get('/lookups/marking-types', {
      params: { format: CritterbaseFormatEnum.AS_SELECT }
    });

    return response.data;
  }

  /**
   * Fetches qualitative and quantitative measurements for the specified taxon.
   *
   * @param {string} tsn - The taxon serial number (TSN).
   * @returns {Promise<{ qualitative: CBQualitativeMeasurementTypeDefinition[], quantitative: CBQuantitativeMeasurementTypeDefinition[] }>} - The response data containing qualitative and quantitative measurements.
   */
  async getTaxonMeasurements(tsn: string): Promise<{
    qualitative: CBQualitativeMeasurementTypeDefinition[];
    quantitative: CBQuantitativeMeasurementTypeDefinition[];
  }> {
    const response = await this.axiosInstance.get('/xref/taxon-measurements', { params: { tsn } });

    return response.data;
  }

  /**
   * Fetches body location information for the specified taxon.
   *
   * @param {string} tsn - The taxon serial number (TSN).
   * @returns {Promise<IAsSelectLookup[]>} - The response data containing body location information.
   */
  async getTaxonBodyLocations(tsn: string): Promise<IAsSelectLookup[]> {
    const response = await this.axiosInstance.get('/xref/taxon-marking-body-locations', {
      params: { tsn, format: CritterbaseFormatEnum.AS_SELECT }
    });

    return response.data;
  }

  /**
   * Fetches qualitative options for the specified taxon measurement.
   *
   * @param {string} taxon_measurement_id - The taxon measurement ID.
   * @param {string} [format='asSelect'] - The format of the response data.
   * @returns {Promise<any>} - The response data containing qualitative options.
   */
  async getQualitativeOptions(taxon_measurement_id: string, format = CritterbaseFormatEnum.AS_SELECT): Promise<any> {
    const response = await this.axiosInstance.get('/xref/taxon-qualitative-measurement-options', {
      params: { taxon_measurement_id, format }
    });

    return response.data;
  }

  /**
   * Fetches a list of all families.
   *
   * @returns {Promise<any>} - The response data containing a list of families.
   */
  async getFamilies(): Promise<any> {
    const response = await this.axiosInstance.get('/family');

    return response.data;
  }

  /**
   * Fetches information about a family by its ID.
   *
   * @param {string} family_id - The ID of the family.
   * @returns {Promise<any>} - The response data containing family information.
   */
  async getFamilyById(family_id: string): Promise<any> {
    const response = await this.axiosInstance.get(`/family/${family_id}`);

    return response.data;
  }

  /**
   * Fetches information about a critter by its ID.
   *
   * @param {string} critter_id - The ID of the critter.
   * @returns {Promise<any>} - The response data containing critter information.
   */
  async getCritter(critter_id: string): Promise<any> {
    const response = await this.axiosInstance.get(`/critters/${critter_id}`, {
      params: { format: CritterbaseFormatEnum.DETAILED }
    });

    return response.data;
  }

  async getCaptureById(capture_id: string): Promise<ICapture> {
    const response = await this.axiosInstance.get(`/captures/${capture_id}`, {
      params: { format: CritterbaseFormatEnum.DETAILED }
    });

    return response.data;
  }

  /**
   * Creates a new critter with the provided data.
   *
   * @param {ICreateCritter} data - The data of the critter to be created.
   * @returns {Promise<any>} - The response data from the create operation.
   */
  async createCritter(data: ICreateCritter): Promise<any> {
    const response = await this.axiosInstance.post(`/critters/create`, data);

    return response.data;
  }

  /**
   * Updates critters in bulk with the provided data.
   *
   * @param {IBulkCreate} data - The data for the bulk update.
   * @returns {Promise<any>} - The response data from the update operation.
   */
  async updateCritter(data: IBulkCreate): Promise<any> {
    const response = await this.axiosInstance.patch('/bulk', data);

    return response.data;
  }

  /**
   * Creates critters in bulk with the provided data.
   *
   * @param {IBulkCreate} data
   * @return {*}  {Promise<IBulkCreateResponse>}
   * @memberof CritterbaseService
   */
  async bulkCreate(data: IBulkCreate): Promise<IBulkCreateResponse> {
    const response = await this.axiosInstance.post('/bulk', data);

    return response.data;
  }

  /**
   * Fetches multiple critters by their IDs.
   *
   * @param {string[]} critter_ids - The IDs of the critters.
   * @returns {Promise<ICritter[]>} - The response data containing multiple critters.
   */
  async getMultipleCrittersByIds(critter_ids: string[]): Promise<ICritter[]> {
    const response = await this.axiosInstance.post('/critters', { critter_ids });

    return response.data;
  }

  /**
   * Fetches detailed information about multiple critters by their IDs.
   *
   * @param {string[]} critter_ids - The IDs of the critters.
   * @returns {Promise<ICritterDetailed[]>} - The response data containing detailed information about multiple critters.
   */
  async getMultipleCrittersByIdsDetailed(critter_ids: string[]): Promise<ICritterDetailed[]> {
    const response = await this.axiosInstance.post(
      `/critters`,
      { critter_ids },
      { params: { format: CritterbaseFormatEnum.DETAILED } }
    );

    return response.data;
  }

  /**
   * Fetches detailed information about multiple critters by their IDs.
   *
   * @param {string[]} critter_ids - The IDs of the critters.
   * @returns {Promise<ICritterDetailed[]>} - The response data containing detailed information about multiple critters.
   */
  async getMultipleCrittersGeometryByIds(critter_ids: string[]): Promise<ICritterDetailed[]> {
    const response = await this.axiosInstance.post(`/critters/spatial`, { critter_ids });

    return response.data;
  }

  /**
   * Signs up a user.
   *
   * @returns {Promise<any>} - The response data from the sign-up operation.
   */
  async signUp(): Promise<any> {
    const response = await this.axiosInstance.post('/signup');

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
    const response = await this.axiosInstance.post(`/xref/taxon-qualitative-measurements`, {
      taxon_measurement_ids: taxon_measurement_ids
    });

    return response.data;
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
    const response = await this.axiosInstance.post(`/xref/taxon-quantitative-measurements`, {
      taxon_measurement_ids: taxon_measurement_ids
    });

    return response.data;
  }

  /**
   * Find collection categories by tsn. Includes hierarchies.
   *
   * @async
   * @param {string} tsn - ITIS TSN
   * @returns {Promise<ICollectionCategory[]>} Collection categories
   */
  async findTaxonCollectionCategories(tsn: string): Promise<ICollectionCategory[]> {
    const response = await this.axiosInstance.get(`/xref/taxon-collection-categories`, { params: { tsn } });

    return response.data;
  }

  /**
   * Find collection units by tsn. Includes hierarchies.
   *
   * @async
   * @param {string} tsn - ITIS TSN
   * @returns {Promise<ICollectionUnitWithCategory[]>} Collection units
   */
  async findTaxonCollectionUnits(tsn: string): Promise<ICollectionUnitWithCategory[]> {
    const response = await this.axiosInstance.get(`/xref/taxon-collection-units`, { params: { tsn } });

    return response.data;
  }
}
