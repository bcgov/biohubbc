import {
  createGetFeatureDetails,
  IWFSFeatureDetails,
  layerContentHandlers,
  wfsInferredLayers
} from 'components/map/wfs-utils';
import { Feature } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import L, { LatLngBoundsExpression, LeafletEventHandlerFnMap } from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { throttle } from 'lodash-es';
import React, { useCallback, useEffect, useState } from 'react';
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
import { IMarkerLayer } from './components/MarkerCluster';
import StaticLayers, { IStaticLayer } from './components/StaticLayers';
import WFSFeatureGroup, { IWFSParams } from './WFSFeatureGroup';

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

const MapContainer: React.FC<IMapContainerProps> = (props) => {
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

    onDrawChange([...(drawControls.initialFeatures || []), preDefinedGeometry]);

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

    throttledGetFeatureDetails(wfsInferredLayers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawControls?.initialFeatures, nonEditableGeometries]);

  /*
    Function to get WFS feature details based on the existing map geometries
    and layer types/filter criteria
  */
  const throttledGetFeatureDetails = useCallback(
    throttle(async (typeNames: string[], wfsParams?: IWFSParams) => {
      // Get map geometries based on whether boundary is non editable or drawn/uploaded
      const mapGeometries: Feature[] = determineMapGeometries(drawControls?.initialFeatures, nonEditableGeometries);

      const getFeatureDetails = createGetFeatureDetails(biohubApi.external.post);
      const inferredLayers: IWFSFeatureDetails = await getFeatureDetails(typeNames, mapGeometries, wfsParams);

      if (setInferredLayersInfo) {
        setInferredLayersInfo(inferredLayers);
      }
    }, 300),
    [drawControls?.initialFeatures, nonEditableGeometries]
  );

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
            confirmDeletion={confirmDeletion === undefined ? true : confirmDeletion}
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

        <MarkerClusterGroup layers={markerLayers} />

        <BaseLayerControls />
      </LayersControl>
    </LeafletMapContainer>
  );
};

export default MapContainer;
