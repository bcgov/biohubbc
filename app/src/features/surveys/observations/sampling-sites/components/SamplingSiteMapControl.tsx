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
import FileUploadItem, { IUploadHandler } from 'components/file-upload/FileUploadItem';
import MapContainer from 'components/map/MapContainer';
import SampleSiteFileUploadItemActionButton from 'features/surveys/observations/sampling-sites/components/SampleSiteFileUploadItemActionButton';
import SampleSiteFileUploadItemProgressBar from 'features/surveys/observations/sampling-sites/components/SampleSiteFileUploadItemProgressBar';
import SampleSiteFileUploadItemSubtext from 'features/surveys/observations/sampling-sites/components/SampleSiteFileUploadItemSubtext';
import { FormikContextType } from 'formik';
import { Feature } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import get from 'lodash-es/get';
import { useEffect, useState } from 'react';
import {
  calculateUpdatedMapBounds,
  handleGPXUpload,
  handleKMLUpload,
  handleShapeFileUpload
} from 'utils/mapBoundaryUploadHelpers';

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

  const { name, mapId, formikProps } = props;

  const { values, errors, setFieldValue } = formikProps;

  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);

  const boundaryUploadHandler = (): IUploadHandler => {
    return async (file) => {
      if (file?.type.includes('zip') || file?.name.includes('.zip')) {
        await handleShapeFileUpload(file, name, formikProps);
      } else if (file?.type.includes('gpx') || file?.name.includes('.gpx')) {
        await handleGPXUpload(file, name, formikProps);
      } else if (file?.type.includes('kml') || file?.name.includes('.kml')) {
        await handleKMLUpload(file, name, formikProps);
      }
    };
  };

  const removeFile = () => {
    setFieldValue(name, []);
  };

  // Array of sampling site features
  const samplingSiteGeoJsonFeatures: Feature[] = get(values, name);

  useEffect(() => {
    setUpdatedBounds(calculateUpdatedMapBounds(samplingSiteGeoJsonFeatures));
  }, [samplingSiteGeoJsonFeatures]);

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
            uploadHandler={boundaryUploadHandler()}
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
            <Typography component="span" color="textSecondary" fontWeight="400">
              {samplingSiteGeoJsonFeatures.length > 0
                ? `(${samplingSiteGeoJsonFeatures.length} locations detected)`
                : ''}
            </Typography>
          </Typography>
          <Paper variant="outlined">
            <Box position="relative" height={500}>
              <MapContainer
                mapId={mapId}
                staticLayers={[
                  {
                    layerName: 'Sampling Sites',
                    features: samplingSiteGeoJsonFeatures.map((feature: Feature) => ({ geoJSON: feature }))
                  }
                ]}
                onDrawChange={(newGeo: Feature[]) => setFieldValue(name, newGeo)}
                bounds={updatedBounds}
              />
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
