import React from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { MapContainer as LeafletMapContainer, TileLayer, LayersControl, FeatureGroup, GeoJSON, useMap } from 'react-leaflet';
import MapEditControls from 'utils/MapEditControls';
import { Feature } from 'geojson';
import booleanEqual from '@turf/boolean-equal';
import ReactLeafletKml from "react-leaflet-kml";
import { LatLngBoundsExpression } from 'leaflet';

export interface IMapBoundsProps {
  bounds: LatLngBoundsExpression;
}

const MapBounds: React.FC<IMapBoundsProps> = (props) => {
  const map = useMap();
  const { bounds } = props;

  map.fitBounds(bounds);

  return null;
};

export interface IMapContainerProps {
  classes?: any;
  mapId: string;
  geometryState: { geometry: Feature[]; setGeometry: (geometry: Feature[]) => void };
  nonEditableGeometries?: Feature[];
  uploadedKml?: any;
  bounds?: any;
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const {
    classes,
    mapId,
    geometryState: { geometry, setGeometry },
    nonEditableGeometries,
    uploadedKml,
    bounds
  } = props;

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
      style={{ height: '100%' }}
      id={mapId}
      center={[55, -128]}
      zoom={9}
      scrollWheelZoom={true}>
      {bounds && bounds.length && <MapBounds bounds={bounds} />}

      <FeatureGroup>
        <MapEditControls position="topright" onCreated={handleCreated} geometry={geometry} />
      </FeatureGroup>

      {nonEditableGeometries?.map((nonEditableGeo: Feature) => (
        <GeoJSON key={nonEditableGeo.id} data={nonEditableGeo} />
      ))}

      {uploadedKml && <ReactLeafletKml kml={uploadedKml} />}

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
