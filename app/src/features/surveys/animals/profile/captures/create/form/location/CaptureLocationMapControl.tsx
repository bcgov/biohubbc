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
import { FormikContextType, useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { ICreateCaptureRequest } from 'interfaces/useCritterApi.interface';
import { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet/dist/leaflet.css';
import { get } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

export interface ICaptureLocationMapControlProps {
  name: string;
  title: string;
  mapId: string;
  formikProps: FormikContextType<any>;
}

/**
 * Capture location map control
 *
 * @param {ICaptureLocationMapControlProps} props
 * @return {*}
 */
const CaptureLocationMapControl = (props: ICaptureLocationMapControlProps) => {
  const { name, title } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [lastDrawn, setLastDrawn] = useState<null | number>(null);

  const drawControlsRef = useRef<IDrawControlsRef>();

  const { mapId } = props;

  const { values, setFieldValue, setFieldError, errors } = useFormikContext<ICreateCaptureRequest>();

  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);

  //   Array of sampling site features
  const captureLocationGeoJson: Feature | undefined = useMemo(() => {
    const location: { latitude: number; longitude: number } | Feature = get(values, name);

    if (!location) {
      return;
    }

    if ('latitude' in location && location.latitude !== 0) {
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [location.longitude, location.latitude] },
        properties: {}
      };
    }
    if ('type' in location) {
      return location;
    }
    return;
  }, [name, values]);

  useEffect(() => {
    setUpdatedBounds(calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]));
    if (captureLocationGeoJson) {
      if ('type' in captureLocationGeoJson) {
        if (captureLocationGeoJson.geometry.type === 'Point')
          if (captureLocationGeoJson?.geometry.coordinates[0] !== 0) {
            setUpdatedBounds(calculateUpdatedMapBounds([captureLocationGeoJson]));
          }
      }
    }
  }, [captureLocationGeoJson]);

  return (
    <Grid item xs={12}>
      {get(errors, name) && !Array.isArray(get(errors, name)) && (
        <Alert severity="error" variant="outlined">
          <AlertTitle>Capture location missing</AlertTitle>
          {get(errors, name) as string}
        </Alert>
      )}

      <Box component="fieldset" mt={2}>
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
              drawControlsRef?.current?.addLayer(features[0], () => {
                1;
              });
              setLastDrawn(1);
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

                    const feature = event.layer.toGeoJSON();
                    setFieldValue(name, feature);
                    // Set last drawn to remove it if a subsequent shape is added. There can only be one shape.
                    setLastDrawn(id);
                  }}
                  onLayerEdit={(event: DrawEvents.Edited) => {
                    event.layers.getLayers().forEach((layer: any) => {
                      const feature = layer.toGeoJSON() as Feature;
                      setFieldValue(name, feature);
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
                        features: get(values, name) ? [{ geoJSON: get(values, name), key: 1 }] : []
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

export default CaptureLocationMapControl;