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
import { useDebounce } from 'hooks/useDebounce';
import { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import { useCallback, useRef, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { createPointFeature } from 'utils/spatial-utils';
import { v4 } from 'uuid';
import { CreateHabitatFeatureFormValues, UpdateHabitatFeatureFormValues } from '../HabitatFeatureFormContainer';

const HABITAT_FEATURE_FORM_DEBOUNCE_MS_DELAY = 500;

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

  const drawControlsRef = useRef<IDrawControlsRef | undefined>(undefined);

  const hasInitialLocation = Boolean(formikProps.values.latitude && formikProps.values.longitude);

  const [leafletPointId, setLeafletPointId] = useState<number | undefined>(undefined);
  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(
    hasInitialLocation
      ? calculateUpdatedMapBounds([
          createPointFeature(Number(formikProps.values.latitude), Number(formikProps.values.longitude))
        ])
      : undefined
  );

  const setUpdatedBoundsDebounced = useDebounce(setUpdatedBounds, HABITAT_FEATURE_FORM_DEBOUNCE_MS_DELAY);

  /**
   * Handle the change of the location from the map.
   *
   * @param {Feature} feature
   * @return {*} {void}
   */
  const handleMapLocationChange = (feature: Feature): void => {
    if ('coordinates' in feature.geometry) {
      formikProps.setFieldValue('latitude', Number(feature.geometry.coordinates[1]));
      formikProps.setFieldValue('longitude', Number(feature.geometry.coordinates[0]));

      // instantly update the bounds
      setUpdatedBounds(calculateUpdatedMapBounds([feature]));
    }
  };

  /**
   * Handle the change of the location from the form input.
   *
   * Note: Using null to prevent issues with empty strings being converted to 0.
   *
   * @param {number | null} latitude The latitude value from the form input
   * @param {number | null} longitude The longitude value from the form input
   * @return {*} {void}
   */
  const handleFormInputLocationChange = useCallback(
    (latitude: number | null, longitude: number | null) => {
      // if the latitude or longitude is not
      if (latitude === null || longitude === null) {
        return;
      }

      const feature = createPointFeature(latitude, longitude);

      if (leafletPointId) {
        // delete the existing layer if it exists
        drawControlsRef?.current?.deleteLayer(leafletPointId);
      }

      // add the new layer and update the leaflet point id
      drawControlsRef?.current?.addLayer(feature, setLeafletPointId);

      // update the bounds after the user stops typing
      setUpdatedBoundsDebounced(calculateUpdatedMapBounds([feature]));
    },
    [leafletPointId, setUpdatedBoundsDebounced]
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
              const latitude = formikProps.values.latitude ? Number(event.target.value) : null;
              const longitude = formikProps.values.longitude ? Number(formikProps.values.longitude) : null;

              formikProps.handleChange(event);
              handleFormInputLocationChange(latitude, longitude);
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <CustomTextField
            name="longitude"
            label="Longitude"
            other={{ type: 'number' }}
            onChange={(event) => {
              const latitude = formikProps.values.latitude ? Number(formikProps.values.latitude) : null;
              const longitude = formikProps.values.longitude ? Number(event.target.value) : null;

              formikProps.handleChange(event);
              handleFormInputLocationChange(latitude, longitude);
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
                <StaticLayers
                  layers={
                    !leafletPointId
                      ? [
                          {
                            layerName: 'Habitat Feature Location',
                            features: [
                              {
                                id: v4(),
                                key: `habitat-feature-location-${v4()}`,
                                geoJSON: createPointFeature(
                                  Number(formikProps.values.latitude),
                                  Number(formikProps.values.longitude)
                                )
                              }
                            ]
                          }
                        ]
                      : []
                  }
                />
                <BaseLayerControls />
              </LayersControl>
            </LeafletMapContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
