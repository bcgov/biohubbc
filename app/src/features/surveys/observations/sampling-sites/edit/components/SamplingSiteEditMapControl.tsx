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
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import StaticLayers, { IStaticLayer } from 'components/map/components/StaticLayers';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from 'constants/spatial';
import { SurveyContext } from 'contexts/surveyContext';
import SampleSiteFileUploadItemActionButton from 'features/surveys/observations/sampling-sites/components/SampleSiteFileUploadItemActionButton';
import SampleSiteFileUploadItemProgressBar from 'features/surveys/observations/sampling-sites/components/SampleSiteFileUploadItemProgressBar';
import SampleSiteFileUploadItemSubtext from 'features/surveys/observations/sampling-sites/components/SampleSiteFileUploadItemSubtext';
import { FormikContextType } from 'formik';
import { Feature } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import get from 'lodash-es/get';
import { useContext, useEffect, useState } from 'react';
import { LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { useParams } from 'react-router';
import { boundaryUploadHelper, calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { pluralize } from 'utils/Utils';

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

export interface ISamplingSiteEditMapControlProps {
  name: string;
  mapId: string;
  formikProps: FormikContextType<any>;
}

/**
 * Sampling site map component.
 *
 * @param {ISamplingSiteEditMapControlProps} props
 * @return {*}
 */
const SamplingSiteEditMapControl = (props: ISamplingSiteEditMapControlProps) => {
  const classes = useStyles();
  const surveyContext = useContext(SurveyContext);
  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveySampleSiteId: number | null = Number(urlParams['survey_sample_site_id']) || null;

  const sampleSiteData = surveyContext.sampleSiteDataLoader.data
    ? surveyContext.sampleSiteDataLoader.data.sampleSites.find((x) => x.survey_sample_site_id === surveySampleSiteId)
    : undefined;

  const { name, mapId, formikProps } = props;

  const { values, errors, setFieldValue, setFieldError } = formikProps;

  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [staticLayers, setStaticLayers] = useState<IStaticLayer[]>([]);

  const removeFile = () => {
    setFieldValue(name, sampleSiteData?.geojson ? [sampleSiteData?.geojson] : []);
    setFieldError(name, undefined);
  };

  // Array of sampling site features
  const samplingSiteGeoJsonFeatures: Feature[] = get(values, name);

  useEffect(() => {
    setUpdatedBounds(calculateUpdatedMapBounds(samplingSiteGeoJsonFeatures));

    const staticLayers: IStaticLayer[] = [
      {
        layerName: 'Sampling Sites',
        features: samplingSiteGeoJsonFeatures.map((feature: Feature) => ({ geoJSON: feature }))
      }
    ];

    setStaticLayers(staticLayers);
  }, [samplingSiteGeoJsonFeatures]);

  return (
    <Grid item xs={12}>
      <Box my={3}>
        <FileUpload
          uploadHandler={boundaryUploadHelper({
            onSuccess: (features: Feature[]) => {
              setFieldValue(name, [...features]);
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
        {get(errors, name) && (
          <Alert
            sx={{
              mb: 2
            }}
            severity="error">
            <AlertTitle>Multiple boundaries detected</AlertTitle>
            {get(errors, name) as string}
          </Alert>
        )}
        <Paper variant="outlined">
          <Box position="relative" height={500}>
            <LeafletMapContainer
              id={mapId}
              data-testid={`leaflet-${mapId}`}
              style={{ height: 500 }}
              center={MAP_DEFAULT_CENTER}
              zoom={MAP_DEFAULT_ZOOM}
              maxZoom={17}
              fullscreenControl={true}
              scrollWheelZoom={false}>
              <LayersControl position="bottomright">
                <FullScreenScrollingEventHandler bounds={updatedBounds} scrollWheelZoom={false} />
                <SetMapBounds bounds={updatedBounds} />
                <StaticLayers layers={staticLayers} />
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
  );
};

export default SamplingSiteEditMapControl;
