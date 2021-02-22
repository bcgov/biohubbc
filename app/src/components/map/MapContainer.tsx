import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer as LeafletMapContainer, TileLayer, LayersControl } from 'react-leaflet';

export interface IMapContainerProps {
  classes?: any;
  mapId: string;
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  return (
    <LeafletMapContainer className={props.classes.map} id={props.mapId} center={[55, -128]} zoom={9} scrollWheelZoom={true}>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Esri Imagery">
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/en-us/arcgis/products/location-services/services/basemaps">ESRI Basemap</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked name="BC Government">
          <TileLayer
            url='https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}'
          />
        </LayersControl.BaseLayer>
      </LayersControl>
    </LeafletMapContainer>
  );
};

export default MapContainer;
