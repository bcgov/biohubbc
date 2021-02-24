import React from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { MapContainer as LeafletMapContainer, TileLayer, LayersControl, FeatureGroup, GeoJSON } from 'react-leaflet';
import MapEditControls from 'utils/MapEditControls';
import { Feature } from 'geojson';
import booleanEqual from '@turf/boolean-equal';

export interface IMapContainerProps {
  classes?: any;
  mapId: string;
  geometryState: { geometry: Feature[]; setGeometry: (geometry: Feature[]) => void };
  nonEditableGeometries?: Feature[];
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const { classes, mapId, geometryState: { geometry, setGeometry }, nonEditableGeometries } = props;

  const handleCreated = (e: any) => {
    const newGeo: Feature = e.layer.toGeoJSON();

    // @ts-ignore
    setGeometry((geo: Feature[]) => {
      const geoExists = geo.some((existingGeo: Feature) => {
        return booleanEqual(existingGeo, newGeo);
      });

      if (geoExists) {
        return geo;
      }

      return [...geo, newGeo];
    });
  };

  return (
    <LeafletMapContainer
      className={classes?.map}
      id={mapId}
      center={[55, -128]}
      zoom={9}
      scrollWheelZoom={true}>
      <FeatureGroup>
        <MapEditControls position="topright" onCreated={handleCreated} geometry={geometry} />
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
