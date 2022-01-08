import { Feature } from 'geojson';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState, useCallback, ReactElement, Fragment } from 'react';
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
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import {
  determineMapGeometries,
  getInferredLayersInfoByProjectedGeometry,
  getInferredLayersInfoByWFSFeature,
  getLayerTypesToSkipByProjectedGeometry
} from 'utils/mapLayersHelpers';

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

/*
  Because different OpenMaps layers are identified using different keys
  - Parks and NRM regions use the key SHAPE
  - ENV regions and WMU use the key GEOMETRY
*/
const layerGeoFilterTypeMappings = {
  'pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW': 'SHAPE',
  'pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG': 'SHAPE',
  'pub:WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW': 'GEOMETRY',
  'pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW': 'GEOMETRY'
};

const layersToInfer = [
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
  additionalLayers?: ReactElement[];
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
    setInferredLayersInfo,
    additionalLayers
  } = props;

  const restorationTrackerApi = useRestorationTrackerApi();

  const [preDefinedGeometry, setPreDefinedGeometry] = useState<Feature>();

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
   * This is needed because the query for filtering results by geometry and layer(s) intersection
   * is done using CQL_FILTER (https://docs.geoserver.org/master/en/user/services/wfs/vendor.html)
   * and this function takes our projected geometry and converts it into a valid CQL-compatible coordinates string
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

  /*
    Function to get WFS feature details based on the existing map geometries
    and layer types/filter criteria
  */
  const throttledGetFeatureDetails = useCallback(
    throttle(async (typeNames: string[], wfsParams?: IWFSParams) => {
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

      // Get map geometries based on whether boundary is non editable or drawn/uploaded
      const mapGeometries: Feature[] = determineMapGeometries(geometryState?.geometry, nonEditableGeometries);

      // Convert all geometries to BC Albers projection
      const reprojectedGeometries = await Promise.all(changeProjections(mapGeometries));

      const wfsPromises: Promise<any>[] = [];
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
              restorationTrackerApi.external.post(url, requestBody).catch(() => {
                /* catch and ignore errors */
              })
            );
          }
        });
      });
      const wfsResult = await Promise.all(wfsPromises);

      wfsResult.forEach((item: any) => {
        item?.features?.forEach((feature: Feature) => {
          inferredLayersInfo = getInferredLayersInfoByWFSFeature(feature, inferredLayersInfo);
        });
      });

      if (!inferredLayersInfo) {
        return;
      }

      const inferredLayers = {
        parks: Array.from(inferredLayersInfo.parksInfo),
        nrm: Array.from(inferredLayersInfo.nrmInfo),
        env: Array.from(inferredLayersInfo.envInfo),
        wmu: Array.from(inferredLayersInfo.wmuInfo)
      };

      setInferredLayersInfo && setInferredLayersInfo(inferredLayers);
    }, 300),
    [geometryState?.geometry, nonEditableGeometries]
  );

  const FullScreenEventHandler: React.FC<{ bounds?: any[] }> = (props) => {
    const map = useMap();

    map.on('fullscreenchange', function () {
      if (map.isFullscreen()) {
        if (!scrollWheelZoom) {
          // don't change scroll wheel zoom settings if it was enabled by default via props
          map.scrollWheelZoom.enable();
        }
      } else {
        if (!scrollWheelZoom) {
          // don't change scroll wheel zoom settings if it was enabled by default via props
          map.scrollWheelZoom.disable();
        }

        if (props.bounds && props.bounds.length) {
          // reset bounds, if provided, on exit fullscreen
          map.fitBounds(props.bounds);
        }
      }
    });

    return null;
  };

  return (
    <LeafletMapContainer
      className={classes?.map}
      style={{ height: '100%' }}
      id={mapId}
      center={[55, -128]}
      zoom={zoom || 5}
      maxZoom={17}
      fullscreenControl={true}
      scrollWheelZoom={scrollWheelZoom || false}>
      <FullScreenEventHandler bounds={bounds} />

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

      {/* Render any additional layer feature groups */}
      {additionalLayers &&
        additionalLayers.map((additionalLayer: ReactElement, index: number) => (
          <Fragment key={index}>{additionalLayer}</Fragment>
        ))}

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
