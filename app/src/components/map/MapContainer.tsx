import { Feature } from 'geojson';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import {
  FeatureGroup,
  GeoJSON,
  LayersControl,
  MapContainer as LeafletMapContainer,
  TileLayer,
  useMap
} from 'react-leaflet';
import MapEditControls from 'utils/MapEditControls';
import WFSFeatureGroup from './WFSFeatureGroup';

export interface IMapBoundsProps {
  bounds?: any[];
}

export const MapBounds: React.FC<IMapBoundsProps> = (props) => {
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
  zoom?: number;
  hideDrawControls?: boolean;
  hideOverlayLayers?: boolean;
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const {
    classes,
    mapId,
    geometryState,
    nonEditableGeometries,
    bounds,
    zoom,
    hideDrawControls,
    hideOverlayLayers
  } = props;

  const [preDefinedGeometry, setPreDefinedGeometry] = useState<Feature>();

  // Add a geometry defined from an existing overlay feature (via its popup)
  useEffect(() => {
    if (!preDefinedGeometry) {
      return;
    }

    geometryState?.setGeometry([...geometryState.geometry, preDefinedGeometry]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preDefinedGeometry]);

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
      zoom={zoom || 5}
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
        {!hideOverlayLayers && (
          <>
            <LayersControl.Overlay name="Wildlife Management Units">
              <WFSFeatureGroup
                name={'Wildlife Management Units'}
                typeName={'pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW'}
                minZoom={8}
                onSelectGeometry={setPreDefinedGeometry}
              />
            </LayersControl.Overlay>
            <LayersControl.Overlay name="Parks - Section">
              <WFSFeatureGroup
                name={'Parks - Section'}
                typeName={'pub:WHSE_ADMIN_BOUNDARIES.ADM_BC_PARKS_SECTIONS_SP'}
                minZoom={7}
                onSelectGeometry={setPreDefinedGeometry}
              />
            </LayersControl.Overlay>
            <LayersControl.Overlay name="Parks - Regional">
              <WFSFeatureGroup
                name={'Parks - Regional'}
                typeName={'pub:WHSE_ADMIN_BOUNDARIES.ADM_BC_PARKS_REGIONS_SP'}
                minZoom={7}
                onSelectGeometry={setPreDefinedGeometry}
              />
            </LayersControl.Overlay>
          </>
        )}
      </LayersControl>
    </LeafletMapContainer>
  );
};

export default MapContainer;
