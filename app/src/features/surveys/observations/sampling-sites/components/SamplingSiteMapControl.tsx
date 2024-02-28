import { mdiRefresh } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import FileUpload from 'components/file-upload/FileUpload';
import FileUploadItem from 'components/file-upload/FileUploadItem';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import DrawControls, { IDrawControlsRef } from 'components/map/components/DrawControls';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import StaticLayers from 'components/map/components/StaticLayers';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from 'constants/spatial';
import { SurveyContext } from 'contexts/surveyContext';
import SampleSiteFileUploadItemActionButton from 'features/surveys/observations/sampling-sites/components/SampleSiteFileUploadItemActionButton';
import SampleSiteFileUploadItemProgressBar from 'features/surveys/observations/sampling-sites/components/SampleSiteFileUploadItemProgressBar';
import SampleSiteFileUploadItemSubtext from 'features/surveys/observations/sampling-sites/components/SampleSiteFileUploadItemSubtext';
import { FormikContextType } from 'formik';
import { Feature } from 'geojson';
import { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet/dist/leaflet.css';
import get from 'lodash-es/get';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { boundaryUploadHelper, calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { pluralize, shapeFileFeatureDesc, shapeFileFeatureName } from 'utils/Utils';
import { ISurveySampleSite } from '../SamplingSitePage';

const useStyles = makeStyles(() => ({
  zoomToBoundaryExtentBtn: {
    padding: '3px',
    borderRadius: '4px',
    background: '#ffffff',
    color: '#000000',
    border: '2px solid rgba(0,0,0,0.2)',
    backgroundClip: 'padding-box',
    '&:hover': {
      backgroundColor: '#eeeeee'
    }
  }
}));

export interface ISamplingSiteMapControlProps {
  name: string;
  title: string;
  mapId: string;
  formikProps: FormikContextType<any>;
}

/**
 * Sampling site map component.
 *
 * @param {ISamplingSiteMapControlProps} props
 * @return {*}
 */
const SamplingSiteMapControl = (props: ISamplingSiteMapControlProps) => {
  const classes = useStyles();

  const surveyContext = useContext(SurveyContext);
  const [lastDrawn, setLastDrawn] = useState<null | number>(null);

  const drawControlsRef = useRef<IDrawControlsRef>();

  const { name, mapId, formikProps } = props;

  const { values, errors, setFieldValue, setFieldError } = formikProps;

  let numSites = surveyContext.sampleSiteDataLoader.data?.sampleSites.length ?? 0;

  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);

  const removeFile = () => {
    setFieldValue(name, []);
  };

  // Array of sampling site features
  const samplingSiteGeoJsonFeatures: Feature[] = useMemo(
    () => get(values, name).map((site: ISurveySampleSite) => site.geojson),
    [name, values]
  );

  useEffect(() => {
    setUpdatedBounds(calculateUpdatedMapBounds(samplingSiteGeoJsonFeatures));
  }, [samplingSiteGeoJsonFeatures]);

  console.log(samplingSiteGeoJsonFeatures);

  return (
    <>
      <Grid item xs={12}>
        <Box my={3}>
          {get(errors, name) && (
            <Alert
              sx={{
                mb: 2
              }}
              severity="error">
              <AlertTitle>Missing sampling site location</AlertTitle>
              {get(errors, name) as string}
            </Alert>
          )}
          <FileUpload
            uploadHandler={boundaryUploadHelper({
              onSuccess: (features: Feature[]) => {
                setFieldValue(
                  name,
                  features.map((feature) => ({
                    name: shapeFileFeatureName(feature) ?? `Sample Site ${++numSites}`,
                    description: shapeFileFeatureDesc(feature) ?? '',
                    geojson: feature
                  }))
                );
              },
              onFailure: (message: string) => {
                setFieldError(name, message);
              }
            })}
            onRemove={removeFile}
            dropZoneProps={{
              maxNumFiles: 1,
              multiple: false,
              acceptedFileExtensions: '.zip'
            }}
            hideDropZoneOnMaxFiles={true}
            FileUploadItemComponent={FileUploadItem}
            FileUploadItemComponentProps={{
              SubtextComponent: SampleSiteFileUploadItemSubtext,
              ActionButtonComponent: SampleSiteFileUploadItemActionButton,
              ProgressBarComponent: SampleSiteFileUploadItemProgressBar
            }}
          />
        </Box>
        <Box component="fieldset">
          <Typography component="legend" data-testid="funding-source-list-found">
            Site Location Preview &zwnj;
            {samplingSiteGeoJsonFeatures.length > 0 && (
              <Typography component="span" color="textSecondary" fontWeight="400">
                {`(${samplingSiteGeoJsonFeatures.length} ${pluralize(
                  samplingSiteGeoJsonFeatures.length,
                  'location'
                )} detected)`}
              </Typography>
            )}
          </Typography>
          <Paper variant="outlined">
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
                      draw: { circle: false, circlemarker: false }
                    }}
                    onLayerAdd={(event: DrawEvents.Created, id: number) => {
                      if (lastDrawn) {
                        drawControlsRef?.current?.deleteLayer(lastDrawn);
                      }

                      const feature = event.layer.toGeoJSON();
                      setFieldValue(name, [
                        {
                          name: `Sample Site ${++numSites}`,
                          description: '',
                          geojson: feature
                        }
                      ]);
                      // Set last drawn to remove it if a subsequent shape is added. There can only be one shape.
                      setLastDrawn(id);
                    }}
                    onLayerEdit={(event: DrawEvents.Edited) => {
                      event.layers.getLayers().forEach((layer: any) => {
                        const feature = layer.toGeoJSON() as Feature;
                        setFieldValue(name, [
                          {
                            name: `Sample Site ${++numSites}`,
                            description: '',
                            geojson: feature
                          }
                        ]);
                      });
                    }}
                    onLayerDelete={(event: DrawEvents.Deleted) => {
                      setFieldValue(name, []);
                    }}
                  />
                </FeatureGroup>

                <LayersControl position="bottomright">
                  <StaticLayers
                    layers={[
                      {
                        layerName: 'Sampling Sites',
                        features: samplingSiteGeoJsonFeatures
                          .filter((item) => item?.id) // Filter for only drawn features
                          .map((feature, index) => ({ geoJSON: feature, key: index }))
                      }
                    ]}
                  />
                  <BaseLayerControls />
                </LayersControl>
              </LeafletMapContainer>
              {samplingSiteGeoJsonFeatures.length > 0 && (
                <Box position="absolute" top="126px" left="10px" zIndex="999">
                  <IconButton
                    aria-label="zoom to initial extent"
                    title="Zoom to initial extent"
                    className={classes.zoomToBoundaryExtentBtn}
                    onClick={() => {
                      setUpdatedBounds(calculateUpdatedMapBounds(samplingSiteGeoJsonFeatures));
                    }}>
                    <Icon size={1} path={mdiRefresh} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </Grid>
    </>
  );
};

export default SamplingSiteMapControl;
