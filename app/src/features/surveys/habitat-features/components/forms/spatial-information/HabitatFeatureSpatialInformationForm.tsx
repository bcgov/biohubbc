import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CustomTextField from 'components/fields/CustomTextField';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import DrawControls, { IDrawControlsRef } from 'components/map/components/DrawControls';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import StaticLayers from 'components/map/components/StaticLayers';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from 'constants/spatial';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import { useCallback, useRef, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { CreateHabitatFeatureFormValues, UpdateHabitatFeatureFormValues } from '../HabitatFeatureFormContainer';

export interface IHabitatFeatureSpatialInformationFormProps {
  mapId: string;
}

/**
 * Habitat Feature spatial information form.
 *
 * @return {*} {JSX.Element}
 */
export const HabitatFeatureSpatialInformationForm = <
  FormikValuesType extends CreateHabitatFeatureFormValues | UpdateHabitatFeatureFormValues
>(
  props: IHabitatFeatureSpatialInformationFormProps
): JSX.Element => {
  const formikProps = useFormikContext<FormikValuesType>();

  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [leafletPointId, setLeafletPointId] = useState<number | undefined>(undefined);

  const drawControlsRef = useRef<IDrawControlsRef | undefined>(undefined);

  const handleMapLocationChange = (feature: Feature) => {
    if ('coordinates' in feature.geometry) {
      formikProps.setFieldValue('latitude', String(feature.geometry.coordinates[1]));
      formikProps.setFieldValue('longitude', String(feature.geometry.coordinates[0]));

      setUpdatedBounds(calculateUpdatedMapBounds([feature]));
    }
  };

  const handleFormInputLocationChange = useCallback(
    (latitude: number, longitude: number) => {
      if (!leafletPointId) {
        return;
      }

      drawControlsRef?.current?.deleteLayer(leafletPointId);

      const feature: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      };

      drawControlsRef?.current?.addLayer(feature, setLeafletPointId);

      setUpdatedBounds(calculateUpdatedMapBounds([feature]));
    },
    [leafletPointId]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} display="flex" gap={1}>
        <Grid item xs={6}>
          <CustomTextField
            name="latitude"
            label="Latitude"
            other={{ type: 'number' }}
            onChange={(event) => {
              handleFormInputLocationChange(Number(event.target.value), Number(formikProps.values.longitude));
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <CustomTextField
            name="longitude"
            label="Longitude"
            other={{ type: 'number' }}
            onChange={(event) => {
              handleFormInputLocationChange(Number(formikProps.values.latitude), Number(event.target.value));
            }}
          />
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Paper variant="outlined">
          <Box position="relative" height={500}>
            <LeafletMapContainer
              data-testid={`leaflet-${props.mapId}`}
              style={{ height: 500 }}
              id={props.mapId}
              center={MAP_DEFAULT_CENTER}
              zoom={MAP_DEFAULT_ZOOM}
              maxZoom={17}
              fullscreenControl={true}
              scrollWheelZoom={true}>
              <MapBaseCss />
              {/* Allow scroll wheel zoom when in full screen mode */}
              <FullScreenScrollingEventHandler bounds={updatedBounds} scrollWheelZoom={false} />

              {/* Programmatically set map bounds */}
              <SetMapBounds bounds={updatedBounds} />

              <FeatureGroup data-id="draw-control-feature-group" key="draw-control-feature-group">
                <DrawControls
                  ref={drawControlsRef}
                  options={{
                    // Always disable circle, circlemarker, polygon, rectangle, and polyline
                    draw: { circle: false, circlemarker: false, polygon: false, rectangle: false, polyline: false }
                  }}
                  onLayerAdd={(event: DrawEvents.Created, id: number) => {
                    if (leafletPointId) {
                      drawControlsRef?.current?.deleteLayer(leafletPointId);
                    }

                    setLeafletPointId(id);

                    handleMapLocationChange(event.layer.toGeoJSON());
                  }}
                  onLayerEdit={(event: DrawEvents.Edited) => {
                    event.layers.getLayers().forEach((layer: any) => {
                      handleMapLocationChange(layer.toGeoJSON() as Feature);
                    });
                  }}
                  onLayerDelete={() => {
                    formikProps.setFieldValue('latitude', '');
                    formikProps.setFieldValue('longitude', '');
                  }}
                />
              </FeatureGroup>

              <LayersControl position="bottomright">
                <StaticLayers layers={[]} />
                <BaseLayerControls />
              </LayersControl>
            </LeafletMapContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
