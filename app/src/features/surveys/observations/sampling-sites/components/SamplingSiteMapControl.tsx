import { mdiRefresh } from '@mdi/js';
import Icon from '@mdi/react';
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
  },
  toolbarCount: {
    fontWeight: 400
  }
}));

export interface ISamplingSiteMapControlProps {
  name: string;
  title: string;
  mapId: string;
  bounds: LatLngBoundsExpression | undefined;
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

  const { name, mapId, bounds, formikProps } = props;

  const { values, errors, setFieldValue } = formikProps;

  const [shouldUpdateBounds, setShouldUpdateBounds] = useState<boolean>(false);
  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);

  useEffect(() => {
    setShouldUpdateBounds(false);
  }, [updatedBounds]);

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

  return (
    <>
      <Grid item xs={12}>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{
            maxWidth: '90ch'
          }}>
          Import or select a boundary from existing map layers. To select an existing boundary, choose a map layer below
          and click a boundary on the map.
        </Typography>
        <Box mb={3}>
          <Box mt={4} display="flex">
            <FileUpload
              uploadHandler={boundaryUploadHandler()}
              onRemove={removeFile}
              dropZoneProps={{
                acceptedFileExtensions: '.zip',
                maxNumFiles: 1,
                multiple: false
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
          {get(errors, name) && (
            <Box mt={1} mb={3} ml={2}>
              <Typography style={{ fontSize: '12px', color: '#f44336' }}>{get(errors, name) as string}</Typography>
            </Box>
          )}
        </Box>
        <Typography mb={1} variant="h4" component="h2" data-testid="funding-source-list-found">
          Site Boundary Preview &zwnj;
          <Typography className={classes.toolbarCount} component="span" variant="inherit" color="textSecondary">
            {formikProps.values.survey_sample_sites.length > 0
              ? `(${formikProps.values.survey_sample_sites.length} boundaries detected)`
              : ''}
          </Typography>
        </Typography>
        <Paper variant="outlined">
          <Box position="relative" height={500}>
            <MapContainer
              mapId={mapId}
              drawControls={{
                initialFeatures: get(values, name)
              }}
              onDrawChange={(newGeo: Feature[]) => setFieldValue(name, newGeo)}
              bounds={(shouldUpdateBounds && updatedBounds) || bounds}
            />
            {get(values, name) && get(values, name).length > 0 && (
              <Box position="absolute" top="126px" left="10px" zIndex="999">
                <IconButton
                  aria-label="zoom to initial extent"
                  title="Zoom to initial extent"
                  className={classes.zoomToBoundaryExtentBtn}
                  onClick={() => {
                    setUpdatedBounds(calculateUpdatedMapBounds(get(values, name)));
                    setShouldUpdateBounds(true);
                  }}>
                  <Icon size={1} path={mdiRefresh} />
                </IconButton>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    </>
  );
};

export default SamplingSiteMapControl;
