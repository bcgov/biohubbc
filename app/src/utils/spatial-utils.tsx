import { IMarker, IMarkerLayer } from 'components/map/components/MarkerCluster';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import DatasetPopup from 'components/map/DatasetPopup';
import FeaturePopup, { BoundaryCentroidFeature, BoundaryFeature, OccurrenceFeature } from 'components/map/FeaturePopup';
import { LAYER_NAME, SPATIAL_COMPONENT_TYPE } from 'constants/spatial';
import { Feature } from 'geojson';
import { EmptyObject, ISpatialData, ITaxaData } from 'interfaces/useObservationApi.interface';
import { LatLngTuple } from 'leaflet';
import { isObject } from 'lodash-es';

export interface IDataResult {
  key: string;
  name: string;
  count: number;
}

export interface ISpatialDataGroupedBySpecies {
  [species: string]: ISpatialData[];
}

export const parseSpatialDataByType = (spatialDataRecords: ISpatialData[]) => {
  const occurrencesMarkerLayer: IMarkerLayer = { layerName: LAYER_NAME.OCCURRENCES, markers: [] };
  const boundaryStaticLayer: IStaticLayer = { layerName: LAYER_NAME.BOUNDARIES, features: [] };

  for (const spatialRecord of spatialDataRecords) {
    for (const feature of spatialRecord.spatial_data.features) {
      if (feature.geometry.type === 'GeometryCollection') {
        // Not expecting or supporting geometry collections
        continue;
      }

      if (isOccurrenceFeature(feature)) {
        if (!!feature?.geometry.coordinates[0] && !!feature?.geometry.coordinates[1]) {
          // check if species has been toggled on/ off
          const marker = occurrenceMarkerSetup(feature.geometry.coordinates as LatLngTuple, spatialRecord.taxa_data);
          if (marker) {
            occurrencesMarkerLayer.markers.push(marker);
          }
        }
      }

      if (isBoundaryFeature(feature)) {
        // check if dataset has been toggled
        const ids = getSubmissionSpatialComponentIds(spatialRecord);

        boundaryStaticLayer.features.push({
          geoJSON: feature,
          key: feature.id || feature.properties.id,
          popup: <FeaturePopup submissionSpatialComponentIds={ids} />
        });
      }

      if (isBoundaryCentroidFeature(feature)) {
        // check if dataset has been toggled
        const ids = getSubmissionSpatialComponentIds(spatialRecord);

        boundaryStaticLayer.features.push({
          geoJSON: feature,
          key: feature.id || feature.properties.id,
          popup: <DatasetPopup submissionSpatialComponentIds={ids} />
        });
      }
    }
  }

  return { markerLayers: [occurrencesMarkerLayer], staticLayers: [boundaryStaticLayer] };
};

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
 * Takes a geographic point, an array of taxonomy data, and a Record denoting dataset visibility,
 * and produces an IMarker whose FeaturePopup contains submission spatial component IDs
 * commensurate with the given dataset visibility.
 * @param latLng The geograhic point of the marker
 * @param taxaData The taxonomic data for the point (namely submission_spatial_component_ids)
 * @param datasetVisibility The dataset visiblity record
 * @returns An IMarker
 */
const occurrenceMarkerSetup = (latLng: LatLngTuple, taxaData: ITaxaData[]): IMarker | null => {
  const submission_ids: number[] = taxaData.map((item: ITaxaData) => item.submission_spatial_component_id);

  if (submission_ids.length > 0) {
    return {
      position: latLng,
      key: makeKeyFromIds(submission_ids),
      popup: <FeaturePopup submissionSpatialComponentIds={submission_ids} />,
      count: submission_ids.length
    };
  }

  return null;
};

/**
 * Takes an array of ISpatialData and maps it to an IDataResult array denoting visibility based
 * on the given datasetVisibility Record.
 * @param data The array of spatial data
 * @param datasetVisibility a Record denoting dataset visiblity
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
