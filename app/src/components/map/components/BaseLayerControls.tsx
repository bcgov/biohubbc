import React from 'react';
import { LayersControl, TileLayer } from 'react-leaflet';

const BaseLayerControls: React.FC = () => {
  return (
    <>
      <LayersControl.BaseLayer name="World Imagery">
        <TileLayer url="https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      </LayersControl.BaseLayer>
      <LayersControl.BaseLayer checked name="World Topographic Map">
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/en-us/arcgis/products/location-services/services/basemaps">ESRI Basemap</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        />
      </LayersControl.BaseLayer>
    </>
  );
};

export default BaseLayerControls;
