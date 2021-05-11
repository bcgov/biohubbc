import React from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import {
  MapContainer as LeafletMapContainer,
  TileLayer,
  LayersControl,
  FeatureGroup,
  GeoJSON,
  useMap
} from 'react-leaflet';
import MapEditControls from 'utils/MapEditControls';
import { Feature } from 'geojson';

export interface IMapBoundsProps {
  bounds?: any[];
}

const MapBounds: React.FC<IMapBoundsProps> = (props) => {
  const map = useMap();
  const { bounds } = props;

  if (bounds && bounds.length) {
    map.fitBounds(bounds);
  }

  return null;
};

export interface IMapContainerProps {
  classes?: any;
  mapId: string;
  geometryState?: { geometry: Feature[]; setGeometry: (geometry: Feature[]) => void };
  nonEditableGeometries?: Feature[];
  bounds?: any[];
  hideDrawControls?: boolean;
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const { classes, mapId, geometryState, nonEditableGeometries, bounds, hideDrawControls } = props;
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

  return (
    <LeafletMapContainer
      className={classes?.map}
      style={{ height: '100%' }}
      id={mapId}
      center={[55, -128]}
      zoom={5}
      scrollWheelZoom={false}>
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

      {nonEditableGeometries?.map((nonEditableGeo: Feature) => (
        <GeoJSON key={nonEditableGeo.id} data={nonEditableGeo} />
      ))}

      <LayersControl position="bottomright">
        <LayersControl.BaseLayer checked name="Esri Imagery">
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/en-us/arcgis/products/location-services/services/basemaps">ESRI Basemap</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="BC Government">
          <TileLayer url="https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}" />
        </LayersControl.BaseLayer>
      </LayersControl>
    </LeafletMapContainer>
  );
};

export default MapContainer;
