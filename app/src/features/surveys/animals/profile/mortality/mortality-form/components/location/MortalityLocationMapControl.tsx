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
import { getIn, useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { ICreateMortalityRequest, IEditMortalityRequest } from 'interfaces/useCritterApi.interface';
import { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet/dist/leaflet.css';
import { debounce, get } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { getCoordinatesFromGeoJson, isValidCoordinates } from 'utils/Utils';

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
  const mortalityLocationGeoJson: Feature | undefined = useMemo(() => {
    const location: { latitude: number; longitude: number } | Feature = get(values, name);

    if (!location) {
      return;
    }

    if ('latitude' in location && isValidCoordinates(location.latitude, location.longitude)) {
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [location.longitude, location.latitude] },
        properties: {}
      };
    }

    if ('type' in location) {
      return location;
    }
  }, [name, values]);

  const coordinates = mortalityLocationGeoJson && getCoordinatesFromGeoJson(mortalityLocationGeoJson);

  // Initialize state based on formik context for the edit page
  const [latitudeInput, setLatitudeInput] = useState<string>(coordinates ? String(coordinates.latitude) : '');
  const [longitudeInput, setLongitudeInput] = useState<string>(coordinates ? String(coordinates.longitude) : '');

  useEffect(() => {
    if (mortalityLocationGeoJson) {
      if ('type' in mortalityLocationGeoJson) {
        const coordinates = getCoordinatesFromGeoJson(mortalityLocationGeoJson);
        if (isValidCoordinates(coordinates?.latitude, coordinates?.longitude)) {
          setUpdatedBounds(calculateUpdatedMapBounds([mortalityLocationGeoJson]));
        }
      }
    } else {
      setUpdatedBounds(calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]));
    }
  }, [mortalityLocationGeoJson]);

  const updateFormikLocationFromLatLon = useCallback(
    debounce((name, feature) => {
      setFieldValue(name, feature);
    }, 600),
    []
  );

  // Update formik and map when latitude/longitude text inputs change
  useEffect(() => {
    const lat = latitudeInput && parseFloat(latitudeInput);
    const lon = longitudeInput && parseFloat(longitudeInput);

    if (!(lat && lon)) {
      setFieldValue(name, undefined);
      return;
    }

    const feature: Feature = {
      id: 1,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      properties: {}
    };

    updateFormikLocationFromLatLon(name, feature);

    // If coordinates are invalid, reset the map to show nothing
    if (!isValidCoordinates(lat, lon)) {
      drawControlsRef.current?.clearLayers();
      setLastDrawn(1);
      setUpdatedBounds(calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]));
      return;
    }

    // Remove any existing drawn items in the edit layer
    drawControlsRef.current?.clearLayers();
    setLastDrawn(null);
  }, [latitudeInput, longitudeInput]);

  return (
    <Grid item xs={12}>
      {typeof get(errors, name) == 'string' && !Array.isArray(get(errors, name)) && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          <AlertTitle>Missing mortality location</AlertTitle>
          {get(errors, name)}
        </Alert>
      )}

      {getIn(errors, `${name}.geometry.coordinates`) && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          <AlertTitle>Invalid coordinates</AlertTitle>
          {getIn(errors, `${name}.geometry.coordinates`)}
        </Alert>
      )}

      <Box component="fieldset">
        <Paper variant="outlined">
          <ImportBoundaryDialog
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSuccess={(features) => {
              setUpdatedBounds(calculateUpdatedMapBounds(features));
              setFieldValue(name, features[0]);
              setFieldError(name, undefined);
              // Unset last drawn to show staticlayers, where the file geometry is loaded to
              lastDrawn && drawControlsRef?.current?.deleteLayer(lastDrawn);
              drawControlsRef?.current?.addLayer(features[0], () => 1);
              setLastDrawn(1);
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
                if (event.currentTarget.value) {
                  setLatitudeInput(event.currentTarget.value);
                } else {
                  setLatitudeInput('');
                }
              }}
              onLongitudeChange={(event) => {
                if (event.currentTarget.value) {
                  setLongitudeInput(event.currentTarget.value);
                } else {
                  setLongitudeInput('');
                }
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

                    const feature = event.layer.toGeoJSON();
                    setFieldValue(name, feature);
                    // Set last drawn to remove it if a subsequent shape is added. There can only be one shape.
                    setLastDrawn(id);
                    // Update the manual input text boxes to display the drawn lat/lon
                    if ('coordinates' in feature.geometry) {
                      setLatitudeInput(String(feature.geometry.coordinates[1]));
                      setLongitudeInput(String(feature.geometry.coordinates[0]));
                    }
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
                {!lastDrawn && (
                  <StaticLayers
                    layers={[
                      {
                        layerName: 'Sampling Sites',
                        features: get(values, name) ? [{ geoJSON: get(values, name), key: Math.random() }] : []
                      }
                    ]}
                  />
                )}
                <BaseLayerControls />
              </LayersControl>
            </LeafletMapContainer>
          </Box>
        </Paper>
      </Box>
    </Grid>
  );
};
