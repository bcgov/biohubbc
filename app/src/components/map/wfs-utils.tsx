import { Feature, Geometry, MultiPolygon, Point, Polygon, Position } from 'geojson';
import React from 'react';
import { ReProjector } from 'reproj-helper';
import {
  getInferredLayersInfoByProjectedGeometry,
  getInferredLayersInfoByWFSFeature,
  getLayerTypesToSkipByProjectedGeometry
} from 'utils/mapLayersHelpers';
import { defaultWFSParams, IWFSParams } from './WFSFeatureGroup';

/**
 * Alter the projection of an array of features, from EPSG:4326 to EPSG:3005 (BC Albers).
 *
 * @param {Feature[]} geos
 * @return {*}  {Promise<any>[]}
 */
export const changeProjections = (geos: Feature[]): Promise<Feature>[] => {
  const reprojector = new ReProjector();

  return geos.map(
    (geo: Feature) => reprojector.feature(geo).from('EPSG:4326').to('EPSG:3005').project() as Promise<Feature>
  );
};

/**
 * Asserts whether a Geometry object is a MultiPolygon or not.
 * @param geometry A geo-json Geometry object.
 * @returns `true` if `geometry.type === 'MultiPolygon'`, false otherwise.
 */
const isMultiPolygon = (geometry: Geometry): geometry is MultiPolygon => {
  return geometry.type === 'MultiPolygon';
};

/**
 * Asserts whether a Geometry object is a Polygon or not.
 * @param geometry A geo-json Geometry object.
 * @returns `true` if `geometry.type === 'Polygon'`, false otherwise.
 */
const isPolygon = (geometry: Geometry): geometry is Polygon => {
  return geometry.type === 'Polygon';
};

/**
 * Asserts whether a Geometry object is a Point or not.
 * @param geometry A geo-json Geometry object.
 * @returns `true` if `geometry.type === 'Point'`, false otherwise.
 */
const isPoint = (geometry: Geometry): geometry is Point => {
  return geometry.type === 'Point';
};

/**
 * Generate the coordinates string for the reprojected geometries based on geometry type
 *
 * This is needed because the query for filtering results by geometry and layer(s) intersection
 * is done using CQL_FILTER (https://docs.geoserver.org/master/en/user/services/wfs/vendor.html)
 * and this function takes our projected geometry and converts it into a valid CQL-compatible coordinates string
 *
 * @param {Feature} projectedGeometry
 * @returns {string} formatted coordinates string
 *
 */
export const generateCoordinatesString = (projectedGeometry: Geometry) => {
  let coordinatesString = '';

  if (isMultiPolygon(projectedGeometry)) {
    const coordinatesArray: Position[][][] = projectedGeometry.coordinates;
    coordinatesString += '(((';

    coordinatesArray.forEach((coordinateArray: Position[][], arrayIndex: number) => {
      coordinateArray[0].forEach((coordinatePoint: Position, index: number) => {
        coordinatesString += `${coordinatePoint[0]} ${coordinatePoint[1]}`;

        if (index !== coordinateArray[0].length - 1) {
          coordinatesString += ',';
        } else if (arrayIndex !== coordinatesArray.length - 1) {
          coordinatesString += ')),';
        }
      });

      if (arrayIndex !== coordinatesArray.length - 1) {
        coordinatesString += '((';
      }
    });

    coordinatesString += ')))';
  } else if (isPolygon(projectedGeometry)) {
    coordinatesString += '((';
    const coordinatesArray: Position[][] = projectedGeometry.coordinates;

    coordinatesArray[0].forEach((coordinatePoint: Position, index: number) => {
      coordinatesString += `${coordinatePoint[0]} ${coordinatePoint[1]}`;

      if (index !== coordinatesArray[0].length - 1) {
        coordinatesString += ',';
      } else {
        coordinatesString += '))';
      }
    });
  } else if (isPoint(projectedGeometry)) {
    const coordinatesArray: Position = projectedGeometry.coordinates;
    coordinatesString += `(${coordinatesArray[0]} ${coordinatesArray[1]})`;
  }

  return coordinatesString;
};

/**
 * Construct a WFS url to fetch layer information.
 *
 * @param {string} typeName layer name
 * @param {IWFSParams} [wfsParams=defaultWFSParams] wfs url parameters. Will use defaults specified in
 * `defaultWFSParams` for any properties not provided.
 * @return {*}
 */
const buildWFSURL = (typeName: string, wfsParams: IWFSParams = defaultWFSParams) => {
  const params = { ...defaultWFSParams, ...wfsParams };

  return `${params.url}?service=WFS&&version=${params.version}&request=${params.request}&typeName=${typeName}&outputFormat=${params.outputFormat}&srsName=${params.srsName}`;
};

export interface IWFSFeatureDetails {
  parks?: string[];
  nrm?: string[];
  env?: string[];
  wmu?: string[];
}

/*
	Function to get WFS feature details based on the existing map geometries
	and layer types/filter criteria
*/
export const createGetFeatureDetails = (
  externalApiPost: (url: string, body: any) => Promise<{ features?: Feature[] }>
) => async (typeNames: string[], mapGeometries: Feature[], wfsParams?: IWFSParams): Promise<IWFSFeatureDetails> => {
  const parksInfo: Set<string> = new Set(); // Parks and Eco-Reserves
  const nrmInfo: Set<string> = new Set(); // NRM Regions
  const envInfo: Set<string> = new Set(); // ENV Regions
  const wmuInfo: Set<string> = new Set(); // Wildlife Management Units
  let inferredLayersInfo = {
    parksInfo,
    nrmInfo,
    envInfo,
    wmuInfo
  };

  // Convert all geometries to BC Albers projection
  const reprojectedGeometries = await Promise.all(changeProjections(mapGeometries));

  const wfsPromises: Promise<{ features?: Feature[] }>[] = [];
  reprojectedGeometries.forEach((projectedGeo) => {
    let filterCriteria = '';
    const coordinatesString = generateCoordinatesString(projectedGeo.geometry);

    filterCriteria = `${projectedGeo.geometry.type}${coordinatesString}`;
    inferredLayersInfo = getInferredLayersInfoByProjectedGeometry(projectedGeo, inferredLayersInfo);
    const layerTypesToSkip = getLayerTypesToSkipByProjectedGeometry(projectedGeo);

    // Make Open Maps API call to retrieve intersecting features based on geometry and filter criteria
    typeNames.forEach((typeName: string) => {
      if (!layerTypesToSkip.includes(typeName)) {
        const url = buildWFSURL(typeName, wfsParams);
        const geoFilterType = layerGeoFilterTypeMappings[typeName];
        const filterData = `INTERSECTS(${geoFilterType}, ${filterCriteria})`;

        const requestBody = new URLSearchParams();
        requestBody.append('CQL_FILTER', filterData);

        wfsPromises.push(
          /* catch and ignore errors */
          externalApiPost(url, requestBody).catch(() => {}) as Promise<{ features?: Feature[] }>
        );
      }
    });
  });
  const wfsResult = await Promise.all(wfsPromises);

  wfsResult.forEach((item: { features?: Feature[] }) => {
    item?.features?.forEach((feature: Feature) => {
      inferredLayersInfo = getInferredLayersInfoByWFSFeature(feature, inferredLayersInfo);
    });
  });

  if (!inferredLayersInfo) {
    return {};
  }

  return {
    parks: Array.from(inferredLayersInfo.parksInfo),
    nrm: Array.from(inferredLayersInfo.nrmInfo),
    env: Array.from(inferredLayersInfo.envInfo),
    wmu: Array.from(inferredLayersInfo.wmuInfo)
  };
};

/*
  Because different OpenMaps layers are identified using different keys
  - Parks and NRM regions use the key SHAPE
  - ENV regions and WMU use the key GEOMETRY
*/
export const layerGeoFilterTypeMappings = {
  'pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW': 'SHAPE',
  'pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG': 'SHAPE',
  'pub:WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW': 'GEOMETRY',
  'pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW': 'GEOMETRY'
};

export const wfsInferredLayers = [
  'pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW',
  'pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG',
  'pub:WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW',
  'pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW'
];

/*
  Because there is not a 1:1 mapping between the ENV and NRM regions
  As can be seen, there are 2 ENV regions that map to the same NRM region
*/
export const envToNrmRegionsMapping = {
  '1- Vancouver Island': 'West Coast Natural Resource Region',
  '2- Lower Mainland': 'South Coast Natural Resource Region',
  '3- Thompson': 'Thompson-Okanagan Natural Resource Region',
  '8- Okanagan': 'Thompson-Okanagan Natural Resource Region',
  '4- Kootenay': 'Kootenay-Boundary Natural Resource Region',
  '5- Cariboo': 'Cariboo Natural Resource Region',
  '6- Skeena': 'Skeena Natural Resource Region',
  '7- Omineca': 'Omineca Natural Resource Region',
  '9- Peace': 'Northeast Natural Resource Region'
};

export const layerContentHandlers = {
  'pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW': {
    featureKeyHandler: (feature: Feature) => feature?.properties?.OBJECTID,
    popupContentHandler: (feature: Feature) => {
      if (!feature || !feature.properties) {
        return { tooltip: 'Unparsable Feature', content: [] };
      }

      const tooltip = `${feature.properties.WILDLIFE_MGMT_UNIT_ID} - ${feature.properties.GAME_MANAGEMENT_ZONE_ID} - ${feature.properties.GAME_MANAGEMENT_ZONE_NAME}`;

      const content = (
        <>
          <div
            key={`${feature.id}-management-unit-id`}>{`Wildlife Management Unit: ${feature.properties.WILDLIFE_MGMT_UNIT_ID}`}</div>
          <div
            key={`${feature.id}-game-management-zone-id`}>{`Game Management Zone: ${feature.properties.GAME_MANAGEMENT_ZONE_ID}`}</div>
          <div
            key={`${feature.id}-game-management-zone-name`}>{`Game Management Zone Name: ${feature.properties.GAME_MANAGEMENT_ZONE_NAME}`}</div>
          <div key={`${feature.id}-area`}>{`Region Area: ${(feature.properties.FEATURE_AREA_SQM / 10000).toFixed(
            0
          )} ha`}</div>
        </>
      );

      return { tooltip, content };
    }
  },
  'pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW': {
    featureKeyHandler: (feature: Feature) => feature?.properties?.OBJECTID,
    popupContentHandler: (feature: Feature) => {
      if (!feature || !feature.properties) {
        return { tooltip: 'Unparsable Feature', content: [] };
      }

      const tooltip = `${feature.properties.PROTECTED_LANDS_NAME} - ${feature.properties.PROTECTED_LANDS_DESIGNATION}`;

      const content = (
        <>
          <div key={`${feature.id}-lands-name`}>{`Lands Name: ${feature.properties.PROTECTED_LANDS_NAME}`}</div>
          <div
            key={`${feature.id}-lands-designation`}>{`Lands Designation: ${feature.properties.PROTECTED_LANDS_DESIGNATION}`}</div>
          <div key={`${feature.id}-area`}>{`Region Area: ${(feature.properties.FEATURE_AREA_SQM / 10000).toFixed(
            0
          )} ha`}</div>
        </>
      );

      return { tooltip, content };
    }
  },
  'pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG': {
    featureKeyHandler: (feature: Feature) => feature?.properties?.OBJECTID,
    popupContentHandler: (feature: Feature) => {
      if (!feature || !feature.properties) {
        return { tooltip: 'Unparsable Feature', content: [] };
      }

      const tooltip = feature.properties.REGION_NAME;

      const content = (
        <>
          <div key={`${feature.id}-region`}>{`Region Name: ${feature.properties.REGION_NAME}`}</div>
          <div key={`${feature.id}-area`}>{`Region Area: ${(feature.properties.FEATURE_AREA_SQM / 10000).toFixed(
            0
          )} ha`}</div>
        </>
      );

      return { tooltip, content };
    }
  }
};
