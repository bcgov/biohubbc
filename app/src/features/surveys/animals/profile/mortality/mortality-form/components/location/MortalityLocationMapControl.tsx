import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
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
import { getIn, useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { ICreateMortalityRequest, IEditMortalityRequest } from 'interfaces/useCritterApi.interface';
import { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet/dist/leaflet.css';
import { get } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

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

    if ('latitude' in location && location.latitude !== 0 && location.longitude !== 0) {
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

  // Initialize state based on formik context for the edit page
  const [latitudeInput, setLatitudeInput] = useState<string>(
    mortalityLocationGeoJson?.geometry && 'coordinates' in mortalityLocationGeoJson.geometry
      ? String(mortalityLocationGeoJson?.geometry.coordinates[1])
      : ''
  );
  const [longitudeInput, setLongitudeInput] = useState<string>(
    mortalityLocationGeoJson?.geometry && 'coordinates' in mortalityLocationGeoJson.geometry
      ? String(mortalityLocationGeoJson?.geometry.coordinates[0])
      : ''
  );

  useEffect(() => {
    if (mortalityLocationGeoJson) {
      if ('type' in mortalityLocationGeoJson) {
        if (mortalityLocationGeoJson.geometry.type === 'Point')
          if (mortalityLocationGeoJson?.geometry.coordinates[0] !== 0) {
            setUpdatedBounds(calculateUpdatedMapBounds([mortalityLocationGeoJson]));
            return;
          }
      }
    }

    setUpdatedBounds(calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]));
  }, [mortalityLocationGeoJson]);

  // Update formik and map when latitude/longitude text inputs change
  useEffect(() => {
    const lat = latitudeInput && parseFloat(latitudeInput);
    const lon = longitudeInput && parseFloat(longitudeInput);

    if (!(lat && lon)) {
      setFieldValue(name, undefined);
      return;
    }

    const id = 1;
    const feature: Feature = {
      id,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      properties: {}
    };

    // Remove any existing drawn items in the edit layer
    drawControlsRef.current?.clearLayers();
    setLastDrawn(null);

    if (!(lat > -90 && lat < 90 && lon > -180 && lon < 180)) {
      drawControlsRef.current?.clearLayers();
      // lastDrawn controls the visibility of the formik data (i.e., static layer) on the map.
      // When lastDrawn !== null, the capture location in formik is hidden. If the coordinates are invalid, hide the coordinates.
      setLastDrawn(1);
    }

    setFieldValue(name, feature);
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
              // Map features into form data
              const formData = features.map((item: Feature) => ({
                geojson: [item],
                revision_count: 0
              }));
              setUpdatedBounds(calculateUpdatedMapBounds(features));
              setFieldValue(name, formData[0].geojson);
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
            <Stack spacing={1} direction="row" mx={2}>
              <Box>
                <TextField
                  size="small"
                  name="Latitude"
                  label="Latitude"
                  value={latitudeInput}
                  type="number"
                  onChange={(event) => {
                    if (event.currentTarget.value) {
                      setLatitudeInput(event.currentTarget.value);
                    } else {
                      setLatitudeInput('');
                    }
                  }}
                />
              </Box>
              <Box>
                <TextField
                  size="small"
                  name="longitude"
                  label="Longitude"
                  value={longitudeInput}
                  type="number"
                  onChange={(event) => {
                    if (event.currentTarget.value) {
                      setLongitudeInput(event.currentTarget.value);
                    } else {
                      setLongitudeInput('');
                    }
                  }}
                />
              </Box>
            </Stack>
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
                    setLastDrawn(null);
                    setLatitudeInput('');
                    setLongitudeInput('');
                  }}
                />
              </FeatureGroup>

              <LayersControl position="bottomright">
                <StaticLayers
                  layers={[
                    {
                      layerName: 'Sampling Sites',
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
