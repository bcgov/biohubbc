import { layerContentHandlers } from 'components/map/wfs-utils';
import { Feature } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import L, { LatLngBoundsExpression, LeafletEventHandlerFnMap } from 'leaflet';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { throttle } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { FeatureGroup, GeoJSON, LayersControl, MapContainer as LeafletMapContainer, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { determineMapGeometries } from 'utils/mapLayersHelpers';
import { v4 as uuidv4 } from 'uuid';
import AdditionalLayers, { IAdditionalLayers } from './components/AdditionalLayers';
import BaseLayerControls from './components/BaseLayerControls';
import { GetMapBounds, IMapBoundsOnChange, SetMapBounds } from './components/Bounds';
import DrawControls, { IDrawControlsOnChange, IDrawControlsProps } from './components/DrawControls';
import EventHandler from './components/EventHandler';
import FullScreenScrollingEventHandler from './components/FullScreenScrollingEventHandler';
import MarkerCluster, { IMarkerLayer } from './components/MarkerCluster';
import StaticLayers, { IStaticLayer } from './components/StaticLayers';
import WFSFeatureGroup from './WFSFeatureGroup';

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

export interface INonEditableGeometries {
  feature: Feature;
  popupComponent?: JSX.Element;
}

export interface IClusteredPointGeometries {
  coordinates: number[];
  popupComponent?: JSX.Element;
}

export interface IMapContainerProps {
  mapId: string;
  staticLayers?: IStaticLayer[];
  markerLayers?: IMarkerLayer[];
  drawControls?: IDrawControlsProps;
  scrollWheelZoom?: boolean;
  classes?: Record<string, any>;
  bounds?: LatLngBoundsExpression;
  zoom?: number;
  eventHandlers?: LeafletEventHandlerFnMap;
  selectedLayer?: string;
  nonEditableGeometries?: INonEditableGeometries[];
  additionalLayers?: IAdditionalLayers;
  clusteredPointGeometries?: IClusteredPointGeometries[];
  confirmDeletion?: boolean;
  setInferredLayersInfo?: (inferredLayersInfo: any) => void;
  onBoundsChange?: IMapBoundsOnChange;
  onDrawChange?: IDrawControlsOnChange;
}

/**
 * Renders a leaflet map.
 *
 * @param {IMapContainerProps} props
 * @return {*}
 */
const MapContainer = (props: IMapContainerProps) => {
  const {
    classes,
    mapId,
    staticLayers,
    markerLayers,
    drawControls,
    onDrawChange,
    nonEditableGeometries,
    clusteredPointGeometries,
    bounds,
    zoom,
    scrollWheelZoom,
    selectedLayer,
    eventHandlers,
    setInferredLayersInfo,
    additionalLayers,
    confirmDeletion
  } = props;

  const biohubApi = useBiohubApi();

  const [preDefinedGeometry, setPreDefinedGeometry] = useState<Feature>();

  // Add a geometry defined from an existing overlay feature (via its popup)
  useEffect(() => {
    if (!preDefinedGeometry || !drawControls || !onDrawChange) {
      return;
    }

    onDrawChange([...(drawControls.initialFeatures ?? []), preDefinedGeometry]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preDefinedGeometry]);

  useEffect(() => {
    if (!drawControls?.initialFeatures?.length || !nonEditableGeometries?.length) {
      if (setInferredLayersInfo) {
        setInferredLayersInfo({
          parks: [],
          nrm: [],
          env: [],
          wmu: []
        });
      }
    }

    throttledGetFeatureDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawControls?.initialFeatures, nonEditableGeometries]);

  /*
    Function to get WFS feature details based on the existing map geometries
    and layer types/filter criteria
  */
  const throttledGetFeatureDetails = useMemo(
    () =>
      throttle(async () => {
        // Get map geometries based on whether boundary is non editable or drawn/uploaded
        const mapGeometries: Feature[] = determineMapGeometries(drawControls?.initialFeatures, nonEditableGeometries);

        const getFeatureDetails = await biohubApi.spatial.getRegions(mapGeometries);

        if (setInferredLayersInfo) {
          setInferredLayersInfo({
            parks: getFeatureDetails.regions
              .filter((item) => item.sourceLayer === 'WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW')
              .map((item) => item.regionName),
            nrm: getFeatureDetails.regions
              .filter((item) => item.sourceLayer === 'WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG')
              .map((item) => item.regionName),
            env: getFeatureDetails.regions
              .filter((item) => item.sourceLayer === 'WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW')
              .map((item) => item.regionName),
            wmu: getFeatureDetails.regions
              .filter((item) => item.sourceLayer === 'WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW')
              .map((item) => item.regionName)
          });
        }
      }, 300),
    [biohubApi.spatial, drawControls?.initialFeatures, nonEditableGeometries, setInferredLayersInfo]
  );

  return (
    <LeafletMapContainer
      className={classes?.map}
      style={{ height: '100%' }}
      id={mapId}
      center={[55, -128]}
      zoom={zoom ?? 5}
      maxZoom={17}
      fullscreenControl={true}
      scrollWheelZoom={scrollWheelZoom ?? false}>
      <FullScreenScrollingEventHandler bounds={bounds} scrollWheelZoom={Boolean(scrollWheelZoom)} />

      <SetMapBounds bounds={bounds} />
      <GetMapBounds onChange={(newBounds, newZoom) => props.onBoundsChange?.(newBounds, newZoom)} />

      {drawControls && (
        <FeatureGroup data-id="draw-control-feature-group" key="draw-control-feature-group">
          <DrawControls
            {...props.drawControls}
            options={{
              ...props.drawControls?.options,
              // Always disable circle, circlemarker and line
              draw: { ...props.drawControls?.options?.draw, circle: false, circlemarker: false, polyline: false }
            }}
            onChange={onDrawChange}
            confirmDeletion={confirmDeletion ?? true}
          />
        </FeatureGroup>
      )}

      <EventHandler eventHandlers={eventHandlers} />

      {clusteredPointGeometries && clusteredPointGeometries.length > 0 && (
        <MarkerClusterGroup chunkedLoading>
          {clusteredPointGeometries.map((pointGeo: IClusteredPointGeometries, index: number) => (
            <Marker key={index} position={[pointGeo.coordinates[1], pointGeo.coordinates[0]]}>
              {pointGeo.popupComponent}
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}

      {nonEditableGeometries?.map((nonEditableGeo: INonEditableGeometries) => (
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
          existingGeometry={drawControls?.initialFeatures}
          onSelectGeometry={setPreDefinedGeometry}
        />
      )}

      {additionalLayers && <AdditionalLayers layers={additionalLayers} />}

      <LayersControl position="bottomright">
        <StaticLayers layers={staticLayers} />

        <MarkerCluster layers={markerLayers} />

        <BaseLayerControls />
      </LayersControl>
    </LeafletMapContainer>
  );
};

export default MapContainer;
