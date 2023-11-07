import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import DrawControls, { IDrawControlsRef } from 'components/map/components/DrawControls';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import ImportBoundaryDialog from 'components/map/components/ImportBoundaryDialog';
import { IRegionOption, RegionSelector } from 'components/map/components/RegionSelector';
import StaticLayers from 'components/map/components/StaticLayers';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { layerContentHandlers, layerNameHandler } from 'components/map/wfs-utils';
import WFSFeatureGroup from 'components/map/WFSFeatureGroup';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from 'constants/spatial';
import { FormikContextType } from 'formik';
import { Feature, FeatureCollection } from 'geojson';
import L, { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import { useEffect, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { ISurveyLocation, ISurveyLocationForm } from '../StudyAreaForm';

export interface ISurveyAreMapControlProps {
  map_id: string;
  formik_key: string;
  formik_props: FormikContextType<ISurveyLocationForm>;
  draw_controls_ref: React.RefObject<IDrawControlsRef>;
}

export const SurveyAreaMapControl = (props: ISurveyAreMapControlProps) => {
  const { map_id, formik_key, formik_props, draw_controls_ref } = props;
  const { setFieldValue, setFieldError, values } = formik_props;
  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<IRegionOption | null>(null);

  useEffect(() => {
    setUpdatedBounds(calculateUpdatedMapBounds(formik_props.values.locations.map((item) => item.geojson[0])));
  }, [formik_props.values.locations]);

  return (
    <>
      <ImportBoundaryDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={(features) => {
          // Map features into form data
          const formData = features.map((item: Feature, index) => {
            return {
              name: `Study Area ${index + 1}`,
              description: '',
              geojson: [item],
              revision_count: 0
            };
          });
          setUpdatedBounds(calculateUpdatedMapBounds(features));
          setFieldValue(formik_key, [...values.locations, ...formData]);
        }}
        onFailure={(message) => {
          setFieldError(formik_key, message);
        }}
      />
      <Box mt={4} mb={2} display="flex">
        <Button
          color="primary"
          variant="outlined"
          data-testid="boundary_file-upload"
          startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
          onClick={() => {
            setIsOpen(true);
          }}>
          Import
        </Button>
        <Box ml={1}>
          <RegionSelector
            selectedRegion={selectedRegion}
            onRegionSelected={(data) => {
              setSelectedRegion(data);
            }}
          />
        </Box>
      </Box>
      <Paper elevation={0} sx={{ overflow: 'hidden' }}>
        <LeafletMapContainer
          id={map_id}
          data-testid={`leaflet-${map_id}`}
          center={MAP_DEFAULT_CENTER}
          zoom={MAP_DEFAULT_ZOOM}
          style={{ height: 500 }}
          maxZoom={17}
          fullscreenControl={true}
          scrollWheelZoom={false}>
          <MapBaseCss />

          {/* Allow scroll wheel zoom when in full screen mode */}
          <FullScreenScrollingEventHandler bounds={updatedBounds} scrollWheelZoom={false} />

          {/* Programmatically set map bounds */}
          <SetMapBounds bounds={updatedBounds} />

          <FeatureGroup data-id="draw-control-feature-group" key="draw-control-feature-group">
            <DrawControls
              ref={draw_controls_ref}
              options={{
                // Always disable circle, circlemarker and line
                draw: { circle: false, circlemarker: false, polyline: false }
              }}
              onLayerAdd={(event: DrawEvents.Created, id: number) => {
                const feature: Feature = event.layer.toGeoJSON();
                if (feature.properties) {
                  feature.properties.layer_id = id;
                }
                const location: ISurveyLocation = {
                  name: `Drawn Location ${id}`,
                  description: '',
                  geojson: [feature],
                  revision_count: 0,
                  leaflet_id: id
                };
                setFieldValue(formik_key, [...values.locations, location]);
              }}
              onLayerEdit={(event: DrawEvents.Edited) => {
                event.layers.getLayers().forEach((item) => {
                  const layer_id = L.stamp(item);
                  const featureCollection = L.layerGroup([item]).toGeoJSON() as FeatureCollection;
                  const updatedLocations = values.locations.map((location) => {
                    if (location.leaflet_id === layer_id) {
                      location.geojson = [...featureCollection.features];
                    }
                    return location;
                  });
                  setFieldValue(formik_key, [...updatedLocations]);
                });
              }}
              onLayerDelete={(event: DrawEvents.Deleted) => {
                let locationsToFilter = values.locations;
                event.layers.getLayers().forEach((item) => {
                  const layer_id = L.stamp(item);
                  locationsToFilter = locationsToFilter.filter((location) => location.leaflet_id !== layer_id);
                });
                setFieldValue(formik_key, [...locationsToFilter]);
              }}
            />
          </FeatureGroup>

          {selectedRegion && (
            <WFSFeatureGroup
              typeName={selectedRegion.key}
              minZoom={7}
              featureKeyHandler={layerContentHandlers[selectedRegion.key].featureKeyHandler}
              popupContentHandler={layerContentHandlers[selectedRegion.key].popupContentHandler}
              existingGeometry={[]}
              onSelectGeometry={(geo: Feature) => {
                const layerName = layerNameHandler[selectedRegion.key](geo);
                const region: ISurveyLocation = {
                  name: layerName,
                  description: '',
                  geojson: [geo],
                  revision_count: 0
                };
                setFieldValue(formik_key, [...values.locations, region]);
              }}
            />
          )}
          <LayersControl position="bottomright">
            <StaticLayers
              layers={values.locations
                .filter((item) => !item?.leaflet_id) // filter out user drawn locations
                .map((item) => {
                  // Map geojson features into layer objects for leaflet
                  return { layerName: item.name, features: item.geojson.map((geo) => ({ geoJSON: geo })) };
                })}
            />
            <BaseLayerControls />
          </LayersControl>
        </LeafletMapContainer>
      </Paper>
    </>
  );
};
