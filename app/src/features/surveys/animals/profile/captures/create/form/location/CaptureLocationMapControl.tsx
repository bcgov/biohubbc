import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
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
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from 'constants/spatial';
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

// const useStyles = () => {
//   return {
//     zoomToBoundaryExtentBtn: {
//       padding: '3px',
//       borderRadius: '4px',
//       background: '#ffffff',
//       color: '#000000',
//       border: '2px solid rgba(0,0,0,0.2)',
//       backgroundClip: 'padding-box',
//       '&:hover': {
//         backgroundColor: '#eeeeee'
//       }
//     }
//   };
// };

export interface ICaptureLocationMapControlProps {
  name: string;
  title: string;
  mapId: string;
  formikProps: FormikContextType<any>;
}

/**
 * Sampling site map component.
 *
 * @param {ICaptureLocationMapControlProps} props
 * @return {*}
 */
const CaptureLocationMapControl = (props: ICaptureLocationMapControlProps) => {
  const { name, title } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  //   const classes = useStyles();

  //   const surveyContext = useContext(SurveyContext);
  const [lastDrawn, setLastDrawn] = useState<null | number>(null);

  const drawControlsRef = useRef<IDrawControlsRef>();

  const { mapId } = props;

  const { values, setFieldValue } = useFormikContext<ICreateCaptureRequest>();

  //   let numSites = surveyContext.sampleSiteDataLoader.data?.sampleSites.length ?? 0;

  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);

  //   setUpdatedBounds(undefined);

  //   const removeFile = () => {
  //     setFieldValue(name, []);
  //   };

  //   Array of sampling site features
  const captureLocationGeoJson: Feature = useMemo(() => {
    const location: { latitude: number; longitude: number } = get(values, name);
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [location.longitude, location.latitude] },
      properties: { captureId: 1 }
    };
  }, [name, values]);

  console.log(captureLocationGeoJson);
  console.log(values);

  useEffect(() => {
    setUpdatedBounds(calculateUpdatedMapBounds([captureLocationGeoJson]));
  }, [captureLocationGeoJson]);

  return (
    <>
      <Grid item xs={12}>
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
                console.log(message);
                // setFieldError(name, message);
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
                      setFieldValue('location', feature);
                      // Set last drawn to remove it if a subsequent shape is added. There can only be one shape.
                      setLastDrawn(id);
                    }}
                    onLayerEdit={(event: DrawEvents.Edited) => {
                      event.layers.getLayers().forEach((layer: any) => {
                        const feature = layer.toGeoJSON() as Feature;
                        setFieldValue('location', feature);
                      });
                    }}
                    onLayerDelete={() => {
                      setFieldValue('location', null);
                    }}
                  />
                </FeatureGroup>

                <LayersControl position="bottomright">
                  <StaticLayers
                    layers={
                      [
                        //   {
                        //     layerName: 'Sampling Sites',
                        //     features: []
                        //     //     captureLocationGeoJson
                        //     //       .filter((item) => item?.id) // Filter for only drawn features
                        //     //       .map((feature, index) => ({ geoJSON: feature, key: index }))
                        //     //   }
                        //   }
                      ]
                    }
                  />
                  <BaseLayerControls />
                </LayersControl>
              </LeafletMapContainer>
              {/* {captureLocationGeoJson.length > 0 && (
                <Box position="absolute" top="128px" left="16px" zIndex="999">
                  <IconButton
                    aria-label="zoom to initial extent"
                    title="Zoom to initial extent"
                    sx={classes.zoomToBoundaryExtentBtn}
                    onClick={() => {
                      setUpdatedBounds(calculateUpdatedMapBounds(captureLocationGeoJson));
                    }}>
                    <Icon size={1} path={mdiRefresh} />
                  </IconButton>
                </Box>
              )} */}
            </Box>
          </Paper>
        </Box>
      </Grid>
    </>
  );
};

export default CaptureLocationMapControl;
