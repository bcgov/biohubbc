import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import { mdiRefresh, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import InferredLocationDetails, { IInferredLayers } from 'components/boundary/InferredLocationDetails';
import ComponentDialog from 'components/dialog/ComponentDialog';
import MapContainer from 'components/map/MapContainer';
import { ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { FormikContextType } from 'formik';
import { Feature } from 'geojson';
import get from 'lodash-es/get';
import React, { useEffect, useState } from 'react';
import {
  calculateUpdatedMapBounds,
  handleGPXUpload,
  handleKMLUpload,
  handleShapefileUpload
} from 'utils/mapBoundaryUploadHelpers';

const useStyles = makeStyles(() =>
  createStyles({
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
    mapLayerControl: {
      width: '300px',
      '& .MuiInputBase-root': {
        height: '44px'
      }
    }
  })
);

export interface IMapBoundaryProps {
  name: string;
  title: string;
  mapId: string;
  bounds: any[];
  formikProps: FormikContextType<any>;
}

/**
 * Shared component for map boundary component
 *
 * @param {*} props
 * @return {*}
 */
const MapBoundary: React.FC<IMapBoundaryProps> = (props) => {
  const classes = useStyles();

  const { name, title, mapId, bounds, formikProps } = props;

  const { values, errors, setFieldValue } = formikProps;

  const [openUploadBoundary, setOpenUploadBoundary] = useState(false);
  const [shouldUpdateBounds, setShouldUpdateBounds] = useState<boolean>(false);
  const [updatedBounds, setUpdatedBounds] = useState<any[][] | undefined>(undefined);
  const [selectedLayer, setSelectedLayer] = useState('');
  const [inferredLayersInfo, setInferredLayersInfo] = useState<IInferredLayers>({
    parks: [],
    nrm: [],
    env: [],
    wmu: []
  });

  useEffect(() => {
    setShouldUpdateBounds(false);
  }, [updatedBounds]);

  const boundaryUploadHandler = (): IUploadHandler => {
    return (file) => {
      if (file?.type.includes('zip') || file?.name.includes('.zip')) {
        handleShapefileUpload(file, name, formikProps);
      } else if (file?.type.includes('gpx') || file?.name.includes('.gpx')) {
        handleGPXUpload(file, name, formikProps);
      } else if (file?.type.includes('kml') || file?.name.includes('.kml')) {
        handleKMLUpload(file, name, formikProps);
      }

      return Promise.resolve();
    };
  };

  return (
    <>
      <ComponentDialog
        open={openUploadBoundary}
        dialogTitle="Import Boundary"
        onClose={() => setOpenUploadBoundary(false)}>
        <Box>
          <Box mb={3}>
            <Alert severity="info">If importing a shapefile, it must be configured with a valid projection.</Alert>
          </Box>
          <FileUpload
            uploadHandler={boundaryUploadHandler()}
            dropZoneProps={{
              acceptedFileExtensions: ProjectSurveyAttachmentValidExtensions.SPATIAL
            }}
          />
        </Box>
      </ComponentDialog>
      <Grid item xs={12}>
        <Typography variant="h5" component="h3">
          {title}
        </Typography>
        <Typography variant="body1" color="textSecondary" style={{maxWidth: '90ch'}}>
          Import or select a boundary from existing map layers. To select an existing boundary, choose a map layer
          below and click a boundary on the map.
        </Typography>
        <Box mb={3}>
          <Box mt={4} display="flex" alignItems="flex-start">
            <Button
              size="large"
              color="primary"
              data-testid="boundary_file-upload"
              variant="outlined"
              startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
              onClick={() => setOpenUploadBoundary(true)}>
              Import Boundary
            </Button>
            <Box ml={2}>
              <FormControl variant="outlined" size="small" className={classes.mapLayerControl}>
                <InputLabel id="layer">Map Layers</InputLabel>
                <Select
                  id="layer"
                  name="layer"
                  labelId="layer"
                  label="Map Layers"
                  value={selectedLayer}
                  onChange={(event) => setSelectedLayer(event.target.value as string)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Layer' }}>
                  <MenuItem key={1} value="pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW">
                    Wildlife Management Units
                  </MenuItem>
                  <MenuItem key={2} value="pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW">
                    Parks and EcoRegions
                  </MenuItem>
                  <MenuItem key={3} value="pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG">
                    NRM Regional Boundaries
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box ml={1}>
              {selectedLayer && (
                <Button size="large" variant="outlined" onClick={() => setSelectedLayer('')}>
                  Hide Layer
                </Button>
              )}
            </Box>
          </Box>
          {get(errors, name) && (
            <Box mt={1} mb={3} ml={2}>
              <Typography style={{ fontSize: '12px', color: '#f44336' }}>{get(errors, name)}</Typography>
            </Box>
          )}
        </Box>
        <Paper variant="outlined">
          <Box position="relative" height={500}>
            <MapContainer
              mapId={mapId}
              geometryState={{
                geometry: get(values, name),
                setGeometry: (newGeo: Feature[]) => setFieldValue(name, newGeo)
              }}
              bounds={(shouldUpdateBounds && updatedBounds) || bounds}
              selectedLayer={selectedLayer}
              setInferredLayersInfo={setInferredLayersInfo}
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
          {!Object.values(inferredLayersInfo).every((item: any) => !item.length) && (
            <Box p={2}>
              <InferredLocationDetails layers={inferredLayersInfo} />
            </Box>
          )}
        </Paper>
      </Grid>
    </>
  );
};

export default MapBoundary;
