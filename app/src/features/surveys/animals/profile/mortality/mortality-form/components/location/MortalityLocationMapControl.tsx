import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import DrawControls, { IDrawControlsRef } from 'components/map/components/DrawControls';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import ImportBoundaryDialog from 'components/map/components/ImportBoundaryDialog';
import StaticLayers from 'components/map/components/StaticLayers';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { ALL_OF_BC_BOUNDARY, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from 'constants/spatial';
import LatitudeLongitudeTextFields from 'features/surveys/animals/profile/components/LatitudeLongitudeTextFields';
import { useFormikContext } from 'formik';
import { Feature, Point } from 'geojson';
import { ICreateMortalityRequest, IEditMortalityRequest } from 'interfaces/useCritterApi.interface';
import { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet/dist/leaflet.css';
import { debounce, get } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { getCoordinatesFromGeoJson, isGeoJsonPointFeature, isValidCoordinates } from 'utils/spatial-utils';

export interface IMortalityLocationMapControlProps {
  name: string;
  title: string;
  mapId: string;
}

/**
 * Control for selecting a mortality location on a map.
 *
 * @template FormikValuesType
 * @param {IMortalityLocationMapControlProps} props
 * @return {*}
 */
export const MortalityLocationMapControl = <FormikValuesType extends ICreateMortalityRequest | IEditMortalityRequest>(
  props: IMortalityLocationMapControlProps
) => {
  const { name, title } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [lastDrawn, setLastDrawn] = useState<null | number>(null);

  const drawControlsRef = useRef<IDrawControlsRef>();

  const { mapId } = props;

  const { values, setFieldValue, setFieldError, errors } = useFormikContext<FormikValuesType>();

  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);

  // Array of mortality location features. Should only be one.
  const mortalityLocationGeoJson: Feature<Point> | undefined = useMemo(() => {
    const location: { latitude: number; longitude: number } | Feature | undefined | null = get(values, name);

    if (!location) {
      return;
    }

    if (
      'latitude' in location &&
      'longitude' in location &&
      isValidCoordinates(location.latitude, location.longitude)
    ) {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        },
        properties: {}
      };
    }

    if (isGeoJsonPointFeature(location)) {
      return location;
    }
  }, [name, values]);

  const coordinates = mortalityLocationGeoJson && getCoordinatesFromGeoJson(mortalityLocationGeoJson);

  // Initialize state based on formik context for the edit page
  const [latitudeInput, setLatitudeInput] = useState<string>(coordinates ? String(coordinates.latitude) : '');
  const [longitudeInput, setLongitudeInput] = useState<string>(coordinates ? String(coordinates.longitude) : '');

  useEffect(() => {
    if (mortalityLocationGeoJson) {
      const { latitude, longitude } = getCoordinatesFromGeoJson(mortalityLocationGeoJson);

      if (isValidCoordinates(latitude, longitude)) {
        setUpdatedBounds(calculateUpdatedMapBounds([mortalityLocationGeoJson]));
      }
    } else {
      // If the capture location is not a valid point, set the bounds to the entire province
      setUpdatedBounds(calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]));
    }
  }, [mortalityLocationGeoJson]);

  const updateFormikLocationFromLatLon = useMemo(
    () =>
      debounce((name, feature) => {
        setFieldValue(name, feature);
      }, 500),
    [setFieldValue]
  );

  // Update formik and map when latitude/longitude text inputs change
  useEffect(() => {
    const lat = latitudeInput && parseFloat(latitudeInput);
    const lon = longitudeInput && parseFloat(longitudeInput);

    if (!(lat && lon)) {
      setFieldValue(name, undefined);
      return;
    }

    // If coordinates are invalid, reset the map to show nothing
    if (!isValidCoordinates(lat, lon)) {
      drawControlsRef.current?.clearLayers();
      setUpdatedBounds(calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]));
      return;
    }

    const feature: Feature<Point> = {
      id: 1,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      properties: {}
    };

    updateFormikLocationFromLatLon(name, feature);
  }, [latitudeInput, longitudeInput, name, setFieldValue, updateFormikLocationFromLatLon]);

  return (
    <Grid item xs={12}>
      {typeof get(errors, name) === 'string' && !Array.isArray(get(errors, name)) && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          <AlertTitle>Missing mortality location</AlertTitle>
          {get(errors, name)}
        </Alert>
      )}

      <Box component="fieldset">
        <Paper variant="outlined">
          <ImportBoundaryDialog
            dialogTitle="Import Release Location"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSuccess={(features) => {
              setUpdatedBounds(calculateUpdatedMapBounds(features));
              setFieldValue(name, features[0]);
              setFieldError(name, undefined);
              drawControlsRef?.current?.addLayer(features[0], () => 1);
              if ('coordinates' in features[0].geometry) {
                setLatitudeInput(String(features[0].geometry.coordinates[1]));
                setLongitudeInput(String(features[0].geometry.coordinates[0]));
              }
            }}
            onFailure={(message) => {
              setFieldError(name, message);
            }}
          />
          <Toolbar
            disableGutters
            sx={{
              px: 2
            }}>
            <Typography
              data-testid="map-control-title"
              component="div"
              fontWeight="700"
              sx={{
                flex: '1 1 auto'
              }}>
              {title}
            </Typography>
            <LatitudeLongitudeTextFields
              sx={{ mx: 1 }}
              latitudeValue={latitudeInput}
              longitudeValue={longitudeInput}
              onLatitudeChange={(event) => {
                setLatitudeInput(event.currentTarget.value ?? '');
              }}
              onLongitudeChange={(event) => {
                setLongitudeInput(event.currentTarget.value ?? '');
              }}
            />
            <Box display="flex">
              <Button
                color="primary"
                variant="outlined"
                data-testid="mortality-location-upload"
                startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
                onClick={() => {
                  setIsOpen(true);
                }}>
                Import
              </Button>
            </Box>
          </Toolbar>
          <Box position="relative" height={500}>
            <LeafletMapContainer
              data-testid={`leaflet-${mapId}`}
              style={{ height: 500 }}
              id={mapId}
              center={MAP_DEFAULT_CENTER}
              zoom={MAP_DEFAULT_ZOOM}
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
                  ref={drawControlsRef}
                  options={{
                    // Always disable circle, circlemarker and line
                    draw: { circle: false, circlemarker: false, polygon: false, rectangle: false, polyline: false }
                  }}
                  onLayerAdd={(event: DrawEvents.Created, id: number) => {
                    if (lastDrawn) {
                      drawControlsRef?.current?.deleteLayer(lastDrawn);
                    }

                    const feature: Feature = event.layer.toGeoJSON();

                    setFieldError(name, undefined);
                    setFieldValue(name, feature);

                    // Update the manual input text boxes to display the drawn lat/lon
                    if ('coordinates' in feature.geometry) {
                      setLatitudeInput(String(feature.geometry.coordinates[1]));
                      setLongitudeInput(String(feature.geometry.coordinates[0]));
                    }

                    setLastDrawn(id);
                  }}
                  onLayerEdit={(event: DrawEvents.Edited) => {
                    event.layers.getLayers().forEach((layer: any) => {
                      const feature = layer.toGeoJSON() as Feature;
                      setFieldValue(name, feature);
                      // Update the manual input text boxes to display the drawn lat/lon
                      if ('coordinates' in feature.geometry) {
                        setLatitudeInput(String(feature.geometry.coordinates[1]));
                        setLongitudeInput(String(feature.geometry.coordinates[0]));
                      }
                    });
                  }}
                  onLayerDelete={() => {
                    setFieldValue(name, null);
                  }}
                />
              </FeatureGroup>

              <LayersControl position="bottomright">
                <StaticLayers
                  layers={[
                    {
                      layerName: 'Mortality Location',
                      features: get(values, name) ? [{ geoJSON: get(values, name), key: Math.random() }] : []
                    }
                  ]}
                />
                <BaseLayerControls />
              </LayersControl>
            </LeafletMapContainer>
          </Box>
        </Paper>
      </Box>
    </Grid>
  );
};
