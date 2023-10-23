import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import DrawControls2, { IDrawControlsRef } from 'components/map/components/DrawControls2';
import { ImportBoundaryDialog } from 'components/map/components/ImportBoundaryDialog';
import { IRegionOption, RegionSelector } from 'components/map/components/RegionSelector';
import StaticLayers from 'components/map/components/StaticLayers';
import { layerContentHandlers, layerNameHandler } from 'components/map/wfs-utils';
import WFSFeatureGroup from 'components/map/WFSFeatureGroup';
import { FormikContextType } from 'formik';
import { Feature, FeatureCollection } from 'geojson';
import L, { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import { createRef, useEffect, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { ISurveyLocation, ISurveyLocationForm } from '../StudyAreaForm';

export interface ISurveyAreMapControlProps {
  map_id: string;
  title: string;
  formik_key: string;
  formik_props: FormikContextType<ISurveyLocationForm>;
}

export const SurveyAreaMapControl = (props: ISurveyAreMapControlProps) => {
  const { map_id, formik_key, formik_props } = props;
  const { setFieldValue, setFieldError, values } = formik_props;
  const [updatedBounds, setUpdateBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<IRegionOption | null>(null);

  const drawRef = createRef<IDrawControlsRef>();

  useEffect(() => {
    setUpdateBounds(calculateUpdatedMapBounds(formik_props.values.locations.map((item) => item.geojson[0])));
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
          setUpdateBounds(calculateUpdatedMapBounds(features));
          //TODO: need to make this additive
          setFieldValue(formik_key, formData);
        }}
        onFailure={(message) => {
          setFieldError(formik_key, message);
        }}
      />
      <Box mt={4} display="flex" alignItems="flex-start">
        <Button
          sx={{ marginBottom: 1 }}
          color="primary"
          variant="outlined"
          data-testid="boundary_file-upload"
          startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
          onClick={() => {
            setIsOpen(true);
          }}>
          Import Boundary
        </Button>
        <Box ml={2}>
          <RegionSelector
            selectedRegion={selectedRegion}
            onRegionSelected={(data) => {
              setSelectedRegion(data);
            }}
          />
        </Box>
      </Box>
      <LeafletMapContainer
        style={{ height: '100%' }}
        id={map_id}
        center={[55, -128]}
        zoom={5}
        maxZoom={17}
        fullscreenControl={true}
        scrollWheelZoom={false}>
        {/* Programmatically set map bounds */}
        <SetMapBounds bounds={updatedBounds} />

        <FeatureGroup data-id="draw-control-feature-group" key="draw-control-feature-group">
          <DrawControls2
            ref={drawRef}
            options={{
              // Always disable circle, circlemarker and line
              draw: { circle: false, circlemarker: false, polyline: false }
              // edit: { remove: false }
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
            onLayerDelete={(event, id: number) => {
              console.log('onLayerDelete', event);
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
                // Features will be split at upload to each be a single item so it is safe to access the first item
                return { layerName: item.name, features: [{ geoJSON: item.geojson[0] }] };
              })}
          />
          <BaseLayerControls />
        </LayersControl>
      </LeafletMapContainer>
    </>
  );
};
