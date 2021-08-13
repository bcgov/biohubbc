import { Feature } from 'geojson';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState, useCallback } from 'react';
import {
  FeatureGroup,
  GeoJSON,
  LayersControl,
  MapContainer as LeafletMapContainer,
  Marker,
  TileLayer,
  useMap
} from 'react-leaflet';
import MapEditControls from 'utils/MapEditControls';
import WFSFeatureGroup, { defaultWFSParams, IWFSParams } from './WFSFeatureGroup';
import { v4 as uuidv4 } from 'uuid';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import { throttle } from 'lodash-es';
import { ReProjector } from 'reproj-helper';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { getKeyByValue } from 'utils/Utils';

/*
  Get leaflet icons working
*/
//@ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow
});

export interface IMapBoundsProps {
  bounds?: any[];
}

export interface INonEditableGeometries {
  feature: Feature;
  popupComponent?: JSX.Element;
}

export interface IClusteredPointGeometries {
  coordinates: number[];
  popupComponent?: JSX.Element;
}

export const MapBounds: React.FC<IMapBoundsProps> = (props) => {
  const map = useMap();
  const { bounds } = props;

  if (bounds && bounds.length) {
    map.fitBounds(bounds);
  }

  return null;
};

const layerGeoFilterTypeMappings = {
  'pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW': 'SHAPE',
  'pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG': 'SHAPE',
  'pub:WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW': 'GEOMETRY',
  'pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW': 'GEOMETRY'
};

const layerContentHandlers = {
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

export interface IMapContainerProps {
  classes?: any;
  mapId: string;
  scrollWheelZoom?: boolean;
  geometryState?: { geometry: Feature[]; setGeometry: (geometry: Feature[]) => void };
  nonEditableGeometries?: INonEditableGeometries[];
  clusteredPointGeometries?: IClusteredPointGeometries[];
  bounds?: any;
  zoom?: number;
  hideDrawControls?: boolean;
  selectedLayer?: string;
  setInferredLayersInfo?: (inferredLayersInfo: any) => void;
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const {
    classes,
    mapId,
    geometryState,
    nonEditableGeometries,
    clusteredPointGeometries,
    bounds,
    zoom,
    hideDrawControls,
    scrollWheelZoom,
    selectedLayer,
    setInferredLayersInfo
  } = props;

  const biohubApi = useBiohubApi();

  const [preDefinedGeometry, setPreDefinedGeometry] = useState<Feature>();

  const layersToInfer = [
    'pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW',
    'pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG',
    'pub:WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW',
    'pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW'
  ];

  const envToNrmRegionsMapping = {
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

  // Add a geometry defined from an existing overlay feature (via its popup)
  useEffect(() => {
    if (!preDefinedGeometry) {
      return;
    }

    geometryState?.setGeometry([...geometryState.geometry, preDefinedGeometry]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preDefinedGeometry]);

  useEffect(() => {
    if (!geometryState?.geometry.length || !nonEditableGeometries?.length) {
      setInferredLayersInfo &&
        setInferredLayersInfo({
          parks: [],
          nrm: [],
          env: [],
          wmu: []
        });
    }

    throttledGetFeatureDetails(layersToInfer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometryState?.geometry, nonEditableGeometries]);

  let shownDrawControls: any = {};
  let showEditControls: any = {};

  if (hideDrawControls) {
    shownDrawControls.rectangle = false;
    shownDrawControls.circle = false;
    shownDrawControls.polygon = false;
    shownDrawControls.polyline = false;
    shownDrawControls.circlemarker = false;
    shownDrawControls.marker = false;

    showEditControls.edit = false;
    showEditControls.remove = false;
  }

  /**
   * Alter the projection of an array of features, from EPSG:4326 to EPSG:3005 (BC Albers).
   *
   * @param {Feature[]} geos
   * @return {*}  {Promise<any>[]}
   */
  const changeProjections = (geos: Feature[]): Promise<any>[] => {
    const reprojector = new ReProjector();

    return geos.map((geo) => reprojector.feature(geo).from('EPSG:4326').to('EPSG:3005').project());
  };

  /**
   * Generate the coordinates string for the reprojected geometries based on geometry type
   *
   * @param {Feature} projectedGeometry
   * @returns {string} formatted coordinates string
   *
   */
  const generateCoordinatesString = (projectedGeometry: any) => {
    const coordinatesArray = projectedGeometry.coordinates;
    const geometryType = projectedGeometry.type;
    let coordinatesString = '';

    if (geometryType === 'MultiPolygon') {
      coordinatesString += '(((';

      coordinatesArray.forEach((coordinateArray: any[], arrayIndex: number) => {
        coordinateArray[0].forEach((coordinatePoint: any[], index: number) => {
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
    } else if (geometryType === 'Polygon') {
      coordinatesString += '((';

      coordinatesArray[0].forEach((coordinatePoint: any[], index: number) => {
        coordinatesString += `${coordinatePoint[0]} ${coordinatePoint[1]}`;

        if (index !== coordinatesArray[0].length - 1) {
          coordinatesString += ',';
        } else {
          coordinatesString += '))';
        }
      });
    } else if (geometryType === 'Point') {
      coordinatesString += `(${coordinatesArray[0]} ${coordinatesArray[1]})`;
    }

    return coordinatesString;
  };

  /**
   * Determine if a WMU should be added to the list of inferred layers based on ENV region and WMU GMZ ID mapping
   *
   * @param {string} env
   * @param {string} gmzId
   * @returns {boolean}
   */
  const shouldAddWMULayer = (env: string, gmzId: string): boolean => {
    let shouldAdd = false;

    if (
      (env[0] === '7' && gmzId.includes('7O')) ||
      (env[0] === '9' && gmzId.includes('7P')) ||
      (env[0] !== '7' && env[0] !== '9' && gmzId.includes(env[0]))
    ) {
      shouldAdd = true;
    }

    return shouldAdd;
  };

  /**
   * Gets the ENV region name based on the WMU GMZ ID
   *
   * @param {string} gmzId
   * @returns {string} env region name
   */
  const getENVRegionByGMZ = (gmzId: string): string => {
    let env: string = '';

    if (gmzId.includes('1')) {
      env = '1- Vancouver Island';
    } else if (gmzId.includes('2')) {
      env = '2- Lower Mainland';
    } else if (gmzId.includes('3')) {
      env = '3- Thompson';
    } else if (gmzId.includes('4')) {
      env = '4- Kootenay';
    } else if (gmzId.includes('5')) {
      env = '5- Cariboo';
    } else if (gmzId.includes('6')) {
      env = '6- Skeena';
    } else if (gmzId.includes('7P')) {
      env = '9- Peace';
    } else if (gmzId.includes('7O')) {
      env = '7- Omineca';
    } else if (gmzId.includes('8')) {
      env = '8- Okanagan';
    }

    return env;
  };

  // TODO break this into smaller functions
  const throttledGetFeatureDetails = useCallback(
    throttle(async (typeNames: string[], wfsParams?: IWFSParams) => {
      let inferredLayersInfo;
      const parksInfo: Set<string> = new Set(); // Parks and Eco-Reserves
      const nrmInfo: Set<string> = new Set(); // NRM Regions
      const envInfo: Set<string> = new Set(); // ENV Regions
      const wmuInfo: Set<string> = new Set(); // Wildlife Management Units

      let drawnGeometries: any[] = [];

      if (geometryState?.geometry.length) {
        drawnGeometries = geometryState?.geometry;
      } else if (nonEditableGeometries) {
        drawnGeometries = nonEditableGeometries.map((geo: INonEditableGeometries) => geo.feature);
      }

      // Convert all geometries to BC Albers projection
      const reprojectedGeometries = await Promise.all(changeProjections(drawnGeometries));

      const wfsPromises: Promise<any>[] = [];

      reprojectedGeometries.forEach((projectedGeo) => {
        let filterCriteria = '';
        const coordinatesString = generateCoordinatesString(projectedGeo.geometry);

        filterCriteria = `${projectedGeo.geometry.type}${coordinatesString}`;

        const geoId = projectedGeo.id as string;
        let typeNamesToSkip: string[] = [];

        if (geoId && geoId.includes('TA_PARK_ECORES_PA_SVW')) {
          parksInfo.add(projectedGeo.properties?.PROTECTED_LANDS_NAME);

          typeNamesToSkip.push('pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW');
        }

        if (geoId && geoId.includes('ADM_NR_REGIONS_SPG')) {
          const nrm = projectedGeo.properties?.REGION_NAME;
          const env =
            nrm !== 'Thompson-Okanagan Natural Resource Region'
              ? [getKeyByValue(envToNrmRegionsMapping, nrm)]
              : ['3- Thompson', '8- Okanagan'];

          env.forEach((envRegion) => {
            if (envRegion) {
              envInfo.add(envRegion);
            }
          });
          nrmInfo.add(nrm);

          typeNamesToSkip.push('pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG');
          typeNamesToSkip.push('pub:WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW');
        }

        if (geoId && geoId.includes('EADM_WLAP_REGION_BND_AREA_SVW')) {
          envInfo.add(projectedGeo.properties?.REGION_NUMBER_NAME);
          nrmInfo.add(envToNrmRegionsMapping[projectedGeo.properties?.REGION_NUMBER_NAME]);

          typeNamesToSkip.push('pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG');
          typeNamesToSkip.push('pub:WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW');
        }

        if (geoId && geoId.includes('WAA_WILDLIFE_MGMT_UNITS_SVW')) {
          const gmzId = projectedGeo.properties?.GAME_MANAGEMENT_ZONE_ID;
          const env: string = getENVRegionByGMZ(gmzId);
          const nrm = envToNrmRegionsMapping[env];

          nrmInfo.add(nrm);
          envInfo.add(env);
          wmuInfo.add(
            `${projectedGeo.properties?.WILDLIFE_MGMT_UNIT_ID}, ${gmzId}, ${projectedGeo.properties?.GAME_MANAGEMENT_ZONE_NAME}`
          );

          typeNamesToSkip.push('pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW');
          typeNamesToSkip.push('pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG');
          typeNamesToSkip.push('pub:WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW');
        }

        typeNames.forEach((typeName: string) => {
          if (!typeNamesToSkip.includes(typeName)) {
            const url = buildWFSURL(typeName, wfsParams);
            const geoFilterType = layerGeoFilterTypeMappings[typeName];
            const filterData = `INTERSECTS(${geoFilterType}, ${filterCriteria})`;

            const requestBody = new URLSearchParams();
            requestBody.append('CQL_FILTER', filterData);

            wfsPromises.push(
              biohubApi.external.post(url, requestBody).catch(() => {
                /* catch and ignore errors */
              })
            );
          }
        });
      });

      const wfsResult = await Promise.all(wfsPromises);

      wfsResult.forEach((item: any) => {
        item?.features?.forEach((feature: Feature) => {
          const featureId = feature.id as string;

          if (featureId.includes('TA_PARK_ECORES_PA_SVW')) {
            parksInfo.add(feature.properties?.PROTECTED_LANDS_NAME);
          }

          if (featureId.includes('ADM_NR_REGIONS_SPG')) {
            nrmInfo.add(feature.properties?.REGION_NAME);
          }

          if (featureId.includes('EADM_WLAP_REGION_BND_AREA_SVW')) {
            const nrmRegions = nrmInfo as any;
            for (let nrm of nrmRegions) {
              const env = getKeyByValue(envToNrmRegionsMapping, nrm);

              if (env) {
                envInfo.add(env);
              }
            }
          }

          if (featureId.includes('WAA_WILDLIFE_MGMT_UNITS_SVW')) {
            const gmzId = feature.properties?.GAME_MANAGEMENT_ZONE_ID;
            const envRegions = envInfo as any;

            for (let env of envRegions) {
              const shouldAddWMU = shouldAddWMULayer(env, gmzId);

              if (shouldAddWMU) {
                wmuInfo.add(
                  `${feature.properties?.WILDLIFE_MGMT_UNIT_ID}, ${gmzId}, ${feature.properties?.GAME_MANAGEMENT_ZONE_NAME}`
                );
              }
            }
          }
        });
      });

      inferredLayersInfo = {
        parks: Array.from(parksInfo),
        nrm: Array.from(nrmInfo),
        env: Array.from(envInfo),
        wmu: Array.from(wmuInfo)
      };

      setInferredLayersInfo && setInferredLayersInfo(inferredLayersInfo);
    }, 300),
    [geometryState?.geometry, nonEditableGeometries]
  );

  return (
    <LeafletMapContainer
      className={classes?.map}
      style={{ height: '100%' }}
      id={mapId}
      center={[55, -128]}
      zoom={zoom || 5}
      maxZoom={17}
      scrollWheelZoom={scrollWheelZoom || false}
      whenCreated={(map: any) => {
        //@ts-ignore
        new L.Control.Fullscreen({ position: 'topleft' }).addTo(map);
      }}>
      <MapBounds bounds={bounds} />

      <FeatureGroup>
        <MapEditControls
          position="topright"
          draw={hideDrawControls ? shownDrawControls : { circle: false }}
          edit={hideDrawControls ? showEditControls : undefined}
          geometry={geometryState?.geometry}
          setGeometry={geometryState?.setGeometry}
        />
      </FeatureGroup>

      {clusteredPointGeometries && clusteredPointGeometries.length > 0 && (
        <MarkerClusterGroup chunkedLoading>
          {clusteredPointGeometries.map((pointGeo: IClusteredPointGeometries, index: number) => (
            <Marker key={index} position={[pointGeo.coordinates[1], pointGeo.coordinates[0]]}>
              {pointGeo.popupComponent}
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}

      {nonEditableGeometries?.map((nonEditableGeo: any) => (
        <GeoJSON key={uuidv4()} data={nonEditableGeo.feature}>
          {nonEditableGeo.popupComponent}
        </GeoJSON>
      ))}

      {selectedLayer && (
        <WFSFeatureGroup
          typeName={selectedLayer}
          minZoom={7}
          featureKeyHandler={layerContentHandlers[selectedLayer].featureKeyHandler}
          popupContentHandler={layerContentHandlers[selectedLayer].popupContentHandler}
          existingGeometry={geometryState?.geometry}
          onSelectGeometry={setPreDefinedGeometry}
        />
      )}

      <LayersControl position="bottomright">
        <LayersControl.BaseLayer checked name="BC Government">
          <TileLayer url="https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Esri Imagery">
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/en-us/arcgis/products/location-services/services/basemaps">ESRI Basemap</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
    </LeafletMapContainer>
  );
};

export default MapContainer;
