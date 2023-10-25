import Button from '@mui/material/Button';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { GetMapBounds, IMapBoundsOnChange, SetMapBounds } from 'components/map/components/Bounds';
import DrawControls2, { IDrawControlsProps, IDrawControlsRef } from 'components/map/components/DrawControls2';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import StaticLayers, { IStaticLayer } from 'components/map/components/StaticLayers';
import { layerContentHandlers } from 'components/map/wfs-utils';
import WFSFeatureGroup from 'components/map/WFSFeatureGroup';
import { ALL_OF_BC_BOUNDARY } from 'constants/spatial';
import { Feature } from 'geojson';
import L, { LatLngBoundsExpression } from 'leaflet';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { createRef } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';

//  Get leaflet icons working
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
  drawControls?: IDrawControlsProps;
  scrollWheelZoom?: boolean;
  zoom?: number;
  bounds?: LatLngBoundsExpression;
  selectedLayer?: string;
  onDrawFeature: (geometry: Feature) => void;
  onLayerFeature: (geometry: Feature) => void;
  onBoundsChange?: IMapBoundsOnChange;
}

const StudyAreaMap = (props: IMapContainerProps) => {
  const {
    mapId,
    staticLayers,
    drawControls,
    scrollWheelZoom,
    zoom,
    bounds,
    selectedLayer,
    onLayerFeature,
    onBoundsChange
  } = props;

  const drawRef = createRef<IDrawControlsRef>();

  return (
    <>
      <Button onClick={() => drawRef.current?.addLayer(ALL_OF_BC_BOUNDARY, () => {})}>Add Layer</Button>
      <LeafletMapContainer
        style={{ height: '100%' }}
        id={mapId}
        center={[55, -128]}
        zoom={zoom ?? 5}
        maxZoom={17}
        fullscreenControl={true}
        scrollWheelZoom={scrollWheelZoom ?? false}>
        <FullScreenScrollingEventHandler bounds={bounds} scrollWheelZoom={scrollWheelZoom ?? false} />

        <SetMapBounds bounds={bounds} />
        <GetMapBounds onChange={(newBounds, newZoom) => onBoundsChange?.(newBounds, newZoom)} />

        <FeatureGroup data-id="draw-control-feature-group" key="draw-control-feature-group">
          <DrawControls2
            {...drawControls}
            ref={drawRef}
            options={{
              ...drawControls?.options,
              // Always disable circle, circlemarker and line
              draw: { ...drawControls?.options?.draw, circle: false, circlemarker: false, polyline: false }
            }}
            onLayerAdd={(_) => {}}
            onLayerEdit={(_) => {}}
            onLayerDelete={(_) => {}}
          />
        </FeatureGroup>

        {selectedLayer && (
          <WFSFeatureGroup
            typeName={selectedLayer}
            minZoom={7}
            featureKeyHandler={layerContentHandlers[selectedLayer].featureKeyHandler}
            popupContentHandler={layerContentHandlers[selectedLayer].popupContentHandler}
            existingGeometry={staticLayers?.flatMap((item) => item.features.map((feature) => feature.geoJSON))}
            onSelectGeometry={onLayerFeature}
          />
        )}

        <LayersControl position="bottomright">
          <StaticLayers layers={staticLayers} />
          <BaseLayerControls />
        </LayersControl>
      </LeafletMapContainer>
    </>
  );
};

export default StudyAreaMap;
