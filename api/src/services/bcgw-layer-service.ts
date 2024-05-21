import { XMLParser } from 'fast-xml-parser';
import { Feature } from 'geojson';
import { flatten } from 'lodash';
import { z } from 'zod';
import { IDBConnection } from '../database/db';
import { getLogger } from '../utils/logger';
import { Epsg3005, Srid3005, WebFeatureService, WebMapService } from './geo-service';
import { PostgisService } from './postgis-service';

/**
 * BCGW (BCGov) ENV regional boundaries layer.
 *
 * @see https://catalogue.data.gov.bc.ca/dataset/env-regional-boundaries
 */
export type BcgwEnvRegionsLayer = 'WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW';
export const BcgwEnvRegionsLayer: BcgwEnvRegionsLayer = 'WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW';
/**
 * The name of the field in the layer that contains the spatial data.
 *
 * Note: this value is needed when creating a CQL filter.
 */
export const BcgwEnvRegionsLayerGeometryField = 'GEOMETRY';

/**
 * BCGW (BCGov) NRM regional boundaries layer.
 *
 * @see https://catalogue.data.gov.bc.ca/dataset/natural-resource-nr-regions
 */
export type BcgwNrmRegionsLayer = 'WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG';
export const BcgwNrmRegionsLayer: BcgwNrmRegionsLayer = 'WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG';
/**
 * The name of the field in the layer that contains the spatial data.
 *
 * Note: this value is needed when creating a CQL filter.
 */
export const BcgwNrmRegionsLayerGeometryField = 'SHAPE';

/**
 * BCGW (BCGov) Parks and Ecoreserves boundaries layer.
 *
 * @see https://catalogue.data.gov.bc.ca/dataset/bc-parks-ecological-reserves-and-protected-areas
 */
export type BcgwParksAndEcoreservesLayer = 'WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW';
export const BcgwParksAndEcoreservesLayer: BcgwParksAndEcoreservesLayer = 'WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW';
/**
 * The name of the field in the layer that contains the spatial data.
 *
 * Note: this value is needed when creating a CQL filter.
 */
export const BcgwParksAndEcoreservesLayerGeometryField = 'SHAPE';

/**
 * BCGW (BCGov) wildlife management units layer.
 *
 * @see https://catalogue.data.gov.bc.ca/dataset/wildlife-management-units
 */
export type BcgwWildlifeManagementUnitsLayer = 'WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW';
export const BcgwWildlifeManagementUnitsLayer: BcgwWildlifeManagementUnitsLayer =
  'WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW';
/**
 * The name of the field in the layer that contains the spatial data.
 *
 * Note: this value is needed when creating a CQL filter.
 */
export const BcgwWildlifeManagementUnitsLayerGeometryField = 'GEOMETRY';

/**
 * A mapping of ENV to NRM regions, which are not necessarily 1:1.
 *
 * Note: some ENV regions map to multiple NRM regions.
 */
const envToNrmRegionsMapping = {
  'Vancouver Island': 'West Coast Natural Resource Region',
  'Lower Mainland': 'South Coast Natural Resource Region',
  Thompson: 'Thompson-Okanagan Natural Resource Region',
  Okanagan: 'Thompson-Okanagan Natural Resource Region',
  Kootenay: 'Kootenay-Boundary Natural Resource Region',
  Cariboo: 'Cariboo Natural Resource Region',
  Skeena: 'Skeena Natural Resource Region',
  Omineca: 'Omineca Natural Resource Region',
  Peace: 'Northeast Natural Resource Region'
};

export type RegionDetails = { regionName: string; sourceLayer: string };

const defaultLog = getLogger('services/bcgw-layer-service');
/**
 * Service for fetching information from known BCGW layers.
 *
 * @export
 * @class BcgwLayerService
 */
export class BcgwLayerService {
  webFeatureService: WebFeatureService;
  webMapService: WebMapService;

  xmlParser: XMLParser;

  _xmlParserOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    // Passes all values through as strings. This avoids problems where text fields have numbers only but need to be
    // interpreted as text.
    parseTagValue: false,
    isArray: (tagName: string) => {
      // Ensure specified nodes are always parsed as arrays
      const tagsArray: Array<string> = ['wfs:member'];

      return tagsArray.includes(tagName);
    }
  };

  // Zod schema used to verify the ENV and NRM region GetPropertyValue responses, after converting from XML to JSON.
  _getGetRegionPropertyValueZodSchema = (propertyName: string) =>
    z.object({
      'wfs:ValueCollection': z.object({
        'wfs:member': z
          .array(
            z.object({
              [`pub:${propertyName}`]: z.string()
            })
          )
          .optional()
      })
    });

  constructor() {
    this.webFeatureService = new WebFeatureService();
    this.webMapService = new WebMapService();

    this.xmlParser = new XMLParser(this._xmlParserOptions);
  }

  /**
   * Get region names, from the ENV regions layer, that intersect the provided geometry.
   *
   * @param {string} geometry a WKT geometry string. Must already be in the SRID that matches the ENV layer.
   * @return {*}  {Promise<string[]>}
   * @memberof DatasetRegionService
   */
  async getEnvRegionNames(geometry: string): Promise<string[]> {
    const responseXml = await this.webFeatureService.getPropertyValue({
      typeNames: BcgwEnvRegionsLayer,
      srsName: Epsg3005,
      cql_filter: `INTERSECTS(${BcgwEnvRegionsLayerGeometryField}, ${geometry})`,
      valueReference: 'REGION_NAME'
    });

    try {
      // Convert XML response to JSON and verify with Zod
      const responseObj = this._getGetRegionPropertyValueZodSchema('REGION_NAME').parse(
        this.xmlParser.parse(responseXml as string)
      );

      // Return array of region name values
      return responseObj['wfs:ValueCollection']['wfs:member']?.map((item) => item['pub:REGION_NAME']) ?? [];
    } catch (error) {
      defaultLog.error({ label: 'getEnvRegionNames', message: 'error', error });
      return [];
    }
  }

  /**
   * Get region names, from the NRM regions layer, that intersect the provided geometry.
   *
   * @param {string} geometry a WKT geometry string. Must already be in the SRID that matches the NRM layer.
   * @return {*}  {Promise<string[]>}
   * @memberof DatasetRegionService
   */
  async getNrmRegionNames(geometry: string): Promise<string[]> {
    const responseXml = await this.webFeatureService.getPropertyValue({
      typeNames: BcgwNrmRegionsLayer,
      srsName: Epsg3005,
      cql_filter: `INTERSECTS(${BcgwNrmRegionsLayerGeometryField}, ${geometry})`,
      valueReference: 'REGION_NAME'
    });

    // Convert XML response to JSON and verify with Zod
    const responseObj = this._getGetRegionPropertyValueZodSchema('REGION_NAME').parse(
      this.xmlParser.parse(responseXml as string)
    );

    // Return array of region name values
    return responseObj['wfs:ValueCollection']['wfs:member']?.map((item) => item['pub:REGION_NAME']) ?? [];
  }

  /**
   * Get region names, from the Parks and Ecoreserves layer, that intersect the provided geometry.
   *
   * @param {string} geometry a WKT geometry string. Must already be in the SRID that matches the NRM layer.
   * @return {*}  {Promise<string[]>}
   * @memberof DatasetRegionService
   */
  async getParkAndEcoreserveRegionNames(geometry: string): Promise<string[]> {
    const responseXml = await this.webFeatureService.getPropertyValue({
      typeNames: BcgwParksAndEcoreservesLayer,
      srsName: Epsg3005,
      cql_filter: `INTERSECTS(${BcgwParksAndEcoreservesLayerGeometryField}, ${geometry})`,
      valueReference: 'PROTECTED_LANDS_NAME'
    });

    // Convert XML response to JSON and verify with Zod
    const responseObj = this._getGetRegionPropertyValueZodSchema('PROTECTED_LANDS_NAME').parse(
      this.xmlParser.parse(responseXml as string)
    );

    // Return array of region name values
    return responseObj['wfs:ValueCollection']['wfs:member']?.map((item) => item['pub:PROTECTED_LANDS_NAME']) ?? [];
  }

  /**
   * Get region names, from the Wildlife Management Units layer, that intersect the provided geometry.
   *
   * @param {string} geometry a WKT geometry string. Must already be in the SRID that matches the NRM layer.
   * @return {*}  {Promise<string[]>}
   * @memberof DatasetRegionService
   */
  async getWildlifeManagementUnitRegionNames(geometry: string): Promise<string[]> {
    const responseXml = await this.webFeatureService.getPropertyValue({
      typeNames: BcgwWildlifeManagementUnitsLayer,
      srsName: Epsg3005,
      cql_filter: `INTERSECTS(${BcgwWildlifeManagementUnitsLayerGeometryField}, ${geometry})`,
      valueReference: 'WILDLIFE_MGMT_UNIT_ID'
    });

    // Convert XML response to JSON and verify with Zod
    const responseObj = this._getGetRegionPropertyValueZodSchema('WILDLIFE_MGMT_UNIT_ID').parse(
      this.xmlParser.parse(responseXml as string)
    );

    // Return array of region name values
    return responseObj['wfs:ValueCollection']['wfs:member']?.map((item) => item['pub:WILDLIFE_MGMT_UNIT_ID']) ?? [];
  }

  /**
   * Given a GeoJSON feature, attempt to determine if the feature came from a known BCGW layer, and if so, return
   * its matching region name(s) and source layer details.
   *
   * @param {Feature} feature
   * @return {*}  {(RegionDetails | null)}
   * @memberof BcgwLayerService
   */
  findRegionDetails(feature: Feature): RegionDetails | null {
    if (!feature.id || !feature.properties) {
      // feature is missing any identifying attributes
      return null;
    }

    // check if feature is from the BCGW ENV layer
    if ((feature.id as string).includes(BcgwEnvRegionsLayer)) {
      const regionName = feature.properties?.['REGION_NAME'];

      if (!regionName) {
        // feature has no region name property
        return null;
      }
      // feature is a valid BCGW ENV feature
      return { regionName: regionName, sourceLayer: BcgwEnvRegionsLayer };
    }

    // check if feature is from the BCGW NRM layer
    if ((feature.id as string).includes(BcgwNrmRegionsLayer)) {
      const regionName = feature.properties?.['REGION_NAME'];

      if (!regionName) {
        // feature has no region name property
        return null;
      }
      // feature is a valid BCGW NRM feature
      return { regionName: regionName, sourceLayer: BcgwNrmRegionsLayer };
    }

    // check if feature is from the BCGW Parks and Ecoreserves layer
    if ((feature.id as string).includes(BcgwParksAndEcoreservesLayer)) {
      const regionName = feature.properties?.['PROTECTED_LANDS_NAME'];

      if (!regionName) {
        // feature has no region name property
        return null;
      }

      // feature is a valid BCGW Parks and Ecoreserves feature
      return { regionName: regionName, sourceLayer: BcgwParksAndEcoreservesLayer };
    }

    // check if feature is from the BCGW Wildlife Management Units layer
    if ((feature.id as string).includes(BcgwWildlifeManagementUnitsLayer)) {
      const regionName = feature.properties?.['WILDLIFE_MGMT_UNIT_ID'];

      if (!regionName) {
        // feature has no region name property
        return null;
      }

      // feature is a valid BCGW Wildlife Management Units feature
      return { regionName: regionName, sourceLayer: BcgwWildlifeManagementUnitsLayer };
    }

    // feature is not a known BCGW feature from any known BCGW layer
    return null;
  }

  /**
   * Given an array of RegionDetails items, for each item, if the item came from a known BCGW layer that has a known
   * mapping to another BCGW layer, then include the item's matching region(s) from the other layer in the response.
   *
   * Note: currently this only supports ENV to NRM layer mappings (ie: for all ENV regions, return their matching NRM
   * regions, and vice versa)
   *
   * Why? ENV and NRM regions can be explicitly mapped from one to the other. This allows us to return a list of
   * matching NRM regions for a given ENV region, and nice versa, without having to query the BCGW and more importantly,
   * without running into any inconsistent layer issues (ex: NRM Region 1 should map to ENV Region 2, but due to
   * the polygons in the layers overlapping, NRM Region 1 will return matches for ENV Region 2 AND ENV Region 3, when
   * it shouldn't). As a result we cannot reply fully on the layer query results alone.
   *
   * @param {RegionDetails[]} regionDetails
   * @return {*}  {RegionDetails[]}
   * @memberof BcgwLayerService
   */
  getMappedRegionDetails(regionDetails: RegionDetails[]): RegionDetails[] {
    if (!regionDetails?.length) {
      // feature is missing any identifying attributes
      return [];
    }

    const response = [...regionDetails];

    for (const regionDetail of regionDetails) {
      // Check if the regionDetail item came from the ENV layer
      if (regionDetail.sourceLayer === BcgwEnvRegionsLayer) {
        // Check if the region is a known ENV region that maps to a known NRM region
        const matchingNrmRegion = envToNrmRegionsMapping[regionDetail.regionName];
        if (matchingNrmRegion) {
          // Add NRM region to response
          response.push({ regionName: matchingNrmRegion, sourceLayer: BcgwNrmRegionsLayer });
        }
      }

      // Check if the regionDetail item came from the NRM layer
      if (regionDetail.sourceLayer === BcgwNrmRegionsLayer) {
        // Check if the region is a known NRM region that maps to one or more known ENV regions
        Object.entries(envToNrmRegionsMapping).forEach(([envRegion, nrmRegion]) => {
          if (regionDetail.regionName === nrmRegion) {
            // Return matching ENV region
            response.push({ regionName: envRegion, sourceLayer: BcgwEnvRegionsLayer });
          }
        });
      }
    }

    return response;
  }

  /**
   * For a given GeoJSON Feature, fetch all region details from all supported BCGW layers.
   *
   * @param {Feature} feature
   * @param {IDBConnection} connection
   * @return {*}
   * @memberof BcgwLayerService
   */
  async getRegionsForFeature(feature: Feature, connection: IDBConnection): Promise<RegionDetails[]> {
    // Array of all matching region details for the feature
    let response: RegionDetails[] = [];

    const postgisService = new PostgisService(connection);
    // Convert the feature geometry to WKT format
    const geometryWKTString = await postgisService.getGeoJsonGeometryAsWkt(feature.geometry, Srid3005);

    // Attempt to detect if the feature is a known BCGW feature
    const regionDetails = this.findRegionDetails(feature);

    if (!regionDetails) {
      // Feature is not a known BCGW feature
      // Fetch region details for the feature from ALL available layers
      response = response.concat(
        await this.getAllRegionDetailsForWktString(geometryWKTString, [BcgwEnvRegionsLayer, BcgwNrmRegionsLayer])
      );
    } else {
      // Feature is a known BCGW feature, fetch any additional mapped region details, and add to the overall response
      const mappedRegionDetails = this.getMappedRegionDetails([regionDetails]);
      response = response.concat(mappedRegionDetails);
      // Fetch region details for the feature, excluding the layer whose details were already added above
      // Why? We want to avoid querying a layer using a feature from that same layer because the actual results will not
      // be consistent with the expected results. (Ex: LayerA + Feature1 should return Feature1, but will often return
      // Feature1 + Feature2 + Feature3 due to the layer features containing overlapping coordinates, when ideally they
      // should not).
      const layersToProcess = [BcgwEnvRegionsLayer, BcgwNrmRegionsLayer].filter(
        (layerToProcess) =>
          !mappedRegionDetails.map((mappedRegionDetail) => mappedRegionDetail.sourceLayer).includes(layerToProcess)
      );

      response = response.concat(await this.getAllRegionDetailsForWktString(geometryWKTString, layersToProcess));
    }

    return response;
  }

  async getUniqueRegionsForFeatures(features: Feature[], connection: IDBConnection): Promise<RegionDetails[]> {
    let regionDetails: RegionDetails[] = [];
    for (const feature of features) {
      const result = await this.getRegionsForFeature(feature, connection);
      regionDetails = regionDetails.concat(result);
    }

    // Convert array first into JSON, then into Set, then back to array in order to
    // remove duplicate region information.
    const detailsJSON = regionDetails.map((value) => JSON.stringify(value));
    const uniqueRegionDetails = Array.from(new Set<string>(detailsJSON)).map(
      (value: string) => JSON.parse(value) as RegionDetails
    );
    return uniqueRegionDetails;
  }

  /**
   * Given a geometry WKT string and array of layers to process, return an array of all matching region details for the
   * specified layers.
   *
   * @param {string} geometryWktString a geometry string in Well-Known Text format
   * @param {string[]} layersToProcess an array of supported layers to query against
   * @return {*}
   * @memberof BcgwLayerService
   */
  async getAllRegionDetailsForWktString(geometryWktString: string, layersToProcess: string[]) {
    let response: RegionDetails[] = [];

    for (const layerToProcess of layersToProcess) {
      switch (layerToProcess) {
        case BcgwEnvRegionsLayer:
          response = response.concat(await this.getEnvRegionDetails(geometryWktString));
          break;
        case BcgwNrmRegionsLayer:
          response = response.concat(await this.getNrmRegionDetails(geometryWktString));
          break;
        case BcgwParksAndEcoreservesLayer:
          response = response.concat(await this.getParkAndEcoreserveRegionDetails(geometryWktString));
          break;
        case BcgwWildlifeManagementUnitsLayer:
          response = response.concat(await this.getWildlifeManagementUnitRegionDetails(geometryWktString));
          break;
        default:
          break;
      }
    }

    return response;
  }

  /**
   * Given a geometry WKT string, return an array of matching region detail objects from the BCGW ENV layer.
   *
   * @param {string} geometryWktString
   * @return {*}  {Promise<RegionDetails[]>}
   * @memberof BcgwLayerService
   */
  async getEnvRegionDetails(geometryWktString: string): Promise<RegionDetails[]> {
    const regionNames = await this.getEnvRegionNames(geometryWktString);

    return regionNames.map((name) => ({ regionName: name, sourceLayer: BcgwEnvRegionsLayer }));
  }

  /**
   * Given a geometry WKT string, return an array of matching region detail objects from the BCGW NRM layer.
   *
   * @param {string} geometryWktString
   * @return {*}  {Promise<RegionDetails[]>}
   * @memberof BcgwLayerService
   */
  async getNrmRegionDetails(geometryWktString: string): Promise<RegionDetails[]> {
    const regionNames = await this.getNrmRegionNames(geometryWktString);

    return regionNames.map((name) => ({ regionName: name, sourceLayer: BcgwNrmRegionsLayer }));
  }

  /**
   * Given a geometry WKT string, return an array of matching region detail objects from the BCGW Parks and Ecoreserves
   * layer.
   *
   * @param {string} geometryWktString
   * @return {*}  {Promise<RegionDetails[]>}
   * @memberof BcgwLayerService
   */
  async getParkAndEcoreserveRegionDetails(geometryWktString: string): Promise<RegionDetails[]> {
    const regionNames = await this.getParkAndEcoreserveRegionNames(geometryWktString);

    return regionNames.map((name) => ({ regionName: name, sourceLayer: BcgwParksAndEcoreservesLayer }));
  }

  /**
   * Given a geometry WKT string, return an array of matching region detail objects from the BCGW Wildlife Management
   * Units layer.
   *
   * @param {string} geometryWktString
   * @return {*}  {Promise<RegionDetails[]>}
   * @memberof BcgwLayerService
   */
  async getWildlifeManagementUnitRegionDetails(geometryWktString: string): Promise<RegionDetails[]> {
    const regionNames = await this.getWildlifeManagementUnitRegionNames(geometryWktString);

    return regionNames.map((name) => ({ regionName: name, sourceLayer: BcgwWildlifeManagementUnitsLayer }));
  }

  /**
   * Get array of unique region details of a specific BCGW layer.
   * For a list of features finds the intersecting regions of a BCGW layer.
   *
   * @async
   * @param {Feature[]} features - Array of geojson features
   * @param {(geometryWktString: string) => Promise<RegionDetails[]>} getRegionDetails - ie: getNrmRegionDetails
   * @param {IDBConnection} connection - Database connection
   * @returns {Promise<RegionDetails[]>} Unique region details
   */
  async getUniqueBcgwRegionDetailsFromFeatures(
    features: Feature[],
    getRegionDetails: (geometryWktString: string) => Promise<RegionDetails[]>,
    connection: IDBConnection
  ) {
    const postgisService = new PostgisService(connection);

    // Generate list of PostGIS geometry strings
    const geometryWKTStringArr = await Promise.all(
      features.map((feature) => postgisService.getGeoJsonGeometryAsWkt(feature.geometry, Srid3005))
    );

    // Get NRM region details from PostGIS geometry strings
    const nrmRegionDetailsPromises = await Promise.all(
      geometryWKTStringArr.map((geometryString) => getRegionDetails(geometryString))
    );

    // Flatten the RegionDetails[][] into a single list -> RegionDetails[]
    const flattenedRegions = flatten(await Promise.all(nrmRegionDetailsPromises));

    // Remove duplicates
    const uniqueRegionDetails = Array.from(new Set(flattenedRegions));

    return uniqueRegionDetails;
  }
}
