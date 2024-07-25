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
import { ICreateCaptureRequest, IEditCaptureRequest } from 'interfaces/useCritterApi.interface';
import { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet/dist/leaflet.css';
import { debounce, get } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { getCoordinatesFromGeoJson, isGeoJsonPointFeature, isValidCoordinates } from 'utils/spatial-utils';

export interface ICaptureLocationMapControlProps {
  name: string;
  title: string;
  mapId: string;
}

/**
 * Capture location map control component.
 *
 * This component can be used to record a Point location on a map, for either a capture or release location.
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
  const captureLocationGeoJson: Feature<Point> | undefined = useMemo(() => {
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
        geometry: { type: 'Point', coordinates: [location.longitude, location.latitude] },
        properties: {}
      };
    }

    if (isGeoJsonPointFeature(location)) {
      return location;
    }
  }, [name, values]);

  const coordinates = captureLocationGeoJson && getCoordinatesFromGeoJson(captureLocationGeoJson);

  // Initialize state based on formik context for the edit page
  const [latitudeInput, setLatitudeInput] = useState<string>(coordinates?.latitude ? String(coordinates.latitude) : '');
  const [longitudeInput, setLongitudeInput] = useState<string>(
    coordinates?.longitude ? String(coordinates.longitude) : ''
  );

  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);

  // Update map bounds when the data changes
  useEffect(() => {
    if (captureLocationGeoJson) {
      const { latitude, longitude } = getCoordinatesFromGeoJson(captureLocationGeoJson);

      if (isValidCoordinates(latitude, longitude)) {
        setUpdatedBounds(calculateUpdatedMapBounds([captureLocationGeoJson]));
      }
    } else {
      // If the capture location is not a valid point, set the bounds to the entire province
      setUpdatedBounds(calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]));
    }
  }, [captureLocationGeoJson]);

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

    drawControlsRef.current?.clearLayers();

    // If coordinates are invalid, reset the map to show nothing
    if (!isValidCoordinates(lat, lon)) {
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

    // Update formik through debounce function
    updateFormikLocationFromLatLon(name, feature);
  }, [latitudeInput, longitudeInput, name, setFieldValue, updateFormikLocationFromLatLon]);

  return (
    <Grid item xs={12}>
      {typeof get(errors, name) === 'string' && !Array.isArray(get(errors, name)) && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          <AlertTitle>Missing capture location</AlertTitle>
          {get(errors, name)}
        </Alert>
      )}

      <Box component="fieldset">
        <Paper variant="outlined">
          <ImportBoundaryDialog
            dialogTitle={`Import ${title}`}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSuccess={(features) => {
              setUpdatedBounds(calculateUpdatedMapBounds(features));
              setFieldValue(name, features[0]);
              setFieldError(name, undefined);
              // Unset last drawn to show staticlayers, where the file geometry is loaded to
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

                    const feature: Feature = event.layer.toGeoJSON();

                    setFieldError(name, undefined);
                    setFieldValue(name, feature);

                    if ('coordinates' in feature.geometry) {
                      setLatitudeInput(String(feature.geometry.coordinates[1]));
                      setLongitudeInput(String(feature.geometry.coordinates[0]));
                    }

                    setLastDrawn(id);
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
                <StaticLayers
                  layers={[
                    {
                      layerName: `${title}`,
                      features: get(values, name)
                        ? [
                            {
                              id: Math.random(),
                              key: `capture-location-${Math.random()}`,
                              geoJSON: get(values, name)
                            }
                          ]
                        : []
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
