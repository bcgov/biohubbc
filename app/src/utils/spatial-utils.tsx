import { SPATIAL_COMPONENT_TYPE } from 'constants/spatial';
import { Feature } from 'geojson';
import { EmptyObject, ISpatialData } from 'interfaces/useDwcaApi.interface';
import { isObject } from 'lodash-es';

export interface IDataResult {
  key: string;
  name: string;
  count: number;
}

export type OccurrenceFeature = Feature & { properties: OccurrenceFeatureProperties };

export type OccurrenceFeatureProperties = {
  type: SPATIAL_COMPONENT_TYPE.OCCURRENCE;
};

export type BoundaryFeature = Feature & { properties: BoundaryFeatureProperties };

export type BoundaryFeatureProperties = {
  type: SPATIAL_COMPONENT_TYPE.BOUNDARY;
};

export type BoundaryCentroidFeature = Feature & { properties: BoundaryCentroidFeatureProperties };

export type BoundaryCentroidFeatureProperties = {
  type: SPATIAL_COMPONENT_TYPE.BOUNDARY_CENTROID;
};

export interface ISpatialDataGroupedBySpecies {
  [species: string]: ISpatialData[];
}

/**
 * Helper function to *consistently* make React keys from an array of submission_spatial_component_ids.
 * @param submissionSpatialComponentIds A list of IDs
 * @returns A string joining all the id's by a seperator
 */
const makeKeyFromIds = (submissionSpatialComponentIds: number[]): string => {
  return submissionSpatialComponentIds.join('-');
};

/**
 * Gleans submission spatial component IDs from a spatial component.
 * @param spatialRecord A spatial component record
 * @returns an array of submission_spatial_component_ids
 */
const getSubmissionSpatialComponentIds = (spatialRecord: ISpatialData): number[] => {
  return spatialRecord.taxa_data.map((record: any) => record.submission_spatial_component_id);
};

/**
 * Takes an array of ISpatialData and maps it to an IDataResult array
 * @param data The array of spatial data
 * @returns an array of type IDataResult
 */
export const parseBoundaryCentroidResults = (data: ISpatialData[]): IDataResult[] => {
  const results: IDataResult[] = [];
  data.forEach((spatialData: ISpatialData) => {
    if (isBoundaryCentroidFeature(spatialData.spatial_data.features[0])) {
      const key = makeKeyFromIds(getSubmissionSpatialComponentIds(spatialData));
      results.push({
        key: key,
        name: `${spatialData.spatial_data?.features[0]?.properties?.datasetTitle}`,
        count: 0
      });
    }
  });

  return results;
};

/**
 * Takes an array of ISpatialData and maps it to an IDataResult array denoting visibility based
 * on the given datasetVisibility Record, while numerating the count of each species.
 * @param data The array of spatial data
 * @param datasetVisibility a Record denoting dataset visiblity
 * @returns an array of type IDataResult
 */
export const parseOccurrenceResults = (data: ISpatialData[]): IDataResult[] => {
  const taxaMap: Record<string, IDataResult> = {};
  data.forEach((spatialData) => {
    spatialData.taxa_data.forEach((item: any) => {
      // need to check if it is an occurrence or not
      if (isOccurrenceFeature(spatialData.spatial_data.features[0]) && item.associated_taxa) {
        if (taxaMap[item.associated_taxa] === undefined) {
          taxaMap[item.associated_taxa] = {
            key: item.associated_taxa,
            name: `${item.vernacular_name} (${item.associated_taxa})`,
            count: 0
          };
        }

        taxaMap[item.associated_taxa].count++;
      }
    });
  });

  return Object.values(taxaMap);
};

/**
 * Checks if `obj` is an object with no keys (aka: an empty object)
 */
export const isEmptyObject = (obj: any): obj is EmptyObject => {
  return !!(isObject(obj) && !Object.keys(obj).length);
};

/**
 * Asserts if a feature is an OccurrenceFeature.
 */
export const isOccurrenceFeature = (feature: Feature): feature is OccurrenceFeature => {
  return feature.geometry.type === 'Point' && feature.properties?.['type'] === SPATIAL_COMPONENT_TYPE.OCCURRENCE;
};

/**
 * Asserts if a feature is an BoundaryFeature.
 */
export const isBoundaryFeature = (feature: Feature): feature is BoundaryFeature => {
  return feature?.properties?.['type'] === SPATIAL_COMPONENT_TYPE.BOUNDARY;
};

/**
 * Asserts if a feature is an BoundaryCentroidFeature.
 */
export const isBoundaryCentroidFeature = (feature: Feature): feature is BoundaryCentroidFeature => {
  return feature?.properties?.['type'] === SPATIAL_COMPONENT_TYPE.BOUNDARY_CENTROID;
};
