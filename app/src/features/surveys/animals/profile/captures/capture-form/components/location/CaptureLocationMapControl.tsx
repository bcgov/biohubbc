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
import { ICreateCaptureRequest, IEditCaptureRequest } from 'interfaces/useCritterApi.interface';
import { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet/dist/leaflet.css';
import { debounce, get } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { getCoordinatesFromGeoJson, isValidCoordinates } from 'utils/Utils';

export interface ICaptureLocationMapControlProps {
  name: string;
  title: string;
  mapId: string;
}

/**
 * Capture location map control component.
 *
 * @param {ICaptureLocationMapControlProps} props
 * @return {*}
 */
export const CaptureLocationMapControl = <FormikValuesType extends ICreateCaptureRequest | IEditCaptureRequest>(
  props: ICaptureLocationMapControlProps
) => {
  const { name, title } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [lastDrawn, setLastDrawn] = useState<null | number>(null);

  const { values, setFieldValue, setFieldError, errors } = useFormikContext<FormikValuesType>();

  const drawControlsRef = useRef<IDrawControlsRef>();

  const { mapId } = props;

  // Define location as a GeoJson object using useMemo to memoize the value
  const captureLocationGeoJson: Feature | undefined = useMemo(() => {
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

  const coordinates = captureLocationGeoJson && getCoordinatesFromGeoJson(captureLocationGeoJson);

  // Initialize state based on formik context for the edit page
  const [latitudeInput, setLatitudeInput] = useState<string>(coordinates ? String(coordinates.latitude) : '');
  const [longitudeInput, setLongitudeInput] = useState<string>(coordinates ? String(coordinates.longitude) : '');

  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);

  // Update map bounds when the data changes
  useEffect(() => {
    if (captureLocationGeoJson) {
      if ('type' in captureLocationGeoJson) {
        const coordinates = getCoordinatesFromGeoJson(captureLocationGeoJson);
        if (isValidCoordinates(coordinates?.latitude, coordinates?.longitude)) {
          setUpdatedBounds(calculateUpdatedMapBounds([captureLocationGeoJson]));
        }
      }
    } else {
      setUpdatedBounds(calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]));
    }
  }, [captureLocationGeoJson]);

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

    // Update formik through debounce function
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
          <AlertTitle>Missing capture location</AlertTitle>
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
                data-testid="capture-location-upload"
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
                    // Always disable circle, circlemarker and line
                    draw: { circle: false, circlemarker: false, polygon: false, rectangle: false, polyline: false }
                  }}
                  onLayerAdd={(event: DrawEvents.Created, id: number) => {
                    if (lastDrawn) {
                      drawControlsRef?.current?.deleteLayer(lastDrawn);
                    }
                    setFieldError(name, undefined);
                    const feature: Feature = event.layer.toGeoJSON();
                    setFieldValue(name, feature);
                    // Set last drawn to remove it if a subsequent shape is added. There can only be one shape.
                    setLastDrawn(id);
                    // Update the text box lat/lon inputs
                    if ('coordinates' in feature.geometry) {
                      setLatitudeInput(String(feature.geometry.coordinates[1]));
                      setLongitudeInput(String(feature.geometry.coordinates[0]));
                    }
                  }}
                  onLayerEdit={(event: DrawEvents.Edited) => {
                    event.layers.getLayers().forEach((layer: any) => {
                      const feature: Feature = layer.toGeoJSON() as Feature;
                      setFieldValue(name, feature);
                      // Update the text box lat/lon inputs
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
                        layerName: 'Capture Location',
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
