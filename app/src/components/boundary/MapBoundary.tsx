import { mdiRefresh, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import InferredLocationDetails, { IInferredLayers } from 'components/boundary/InferredLocationDetails';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import MapContainer from 'components/map/MapContainer';
import { ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { FormikContextType } from 'formik';
import { Feature } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import get from 'lodash-es/get';
import { useEffect, useState } from 'react';
import { boundaryUploadHelper, calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

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

export interface IMapBoundaryProps {
  name: string;
  title: string;
  mapId: string;
  bounds: LatLngBoundsExpression | undefined;
  formikProps: FormikContextType<any>;
}

/**
 * Common map component.
 *
 * Includes support/controls for importing a boundary from a file, selecting a boundary from a layer, or drawing a
 * boundary.
 *
 * Includes a section to display inferred boundary information (ex: what regions the boundary intersects, etc).
 *
 * @param {IMapBoundaryProps} props
 * @return {*}
 */
const MapBoundary = (props: IMapBoundaryProps) => {
  const classes = useStyles();

  const { name, title, mapId, bounds, formikProps } = props;

  const { values, errors, setFieldValue, setFieldError } = formikProps;

  const [openUploadBoundary, setOpenUploadBoundary] = useState(false);
  const [shouldUpdateBounds, setShouldUpdateBounds] = useState<boolean>(false);
  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
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
            uploadHandler={boundaryUploadHelper({
              onSuccess: (features) => {
                setFieldValue(name, [...features]);
              },
              onFailure: (message) => {
                setFieldError(name, message);
              }
            })}
            dropZoneProps={{
              acceptedFileExtensions: ProjectSurveyAttachmentValidExtensions.SPATIAL
            }}
          />
        </Box>
      </ComponentDialog>
      <Grid item xs={12}>
        <Typography
          variant="h5"
          component="h3"
          sx={{
            marginBottom: '14px'
          }}>
          {title}
        </Typography>
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
          <Box mt={4} display="flex" alignItems="flex-start">
            <Button
              color="primary"
              variant="outlined"
              data-testid="boundary_file-upload"
              startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
              onClick={() => setOpenUploadBoundary(true)}>
              Import Boundary
            </Button>
            <Box ml={2}>
              <FormControl variant="outlined" size="small">
                <Select
                  size="small"
                  id="layer"
                  name="layer"
                  value={selectedLayer}
                  onChange={(event) => setSelectedLayer(event.target.value as string)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Choose Map Layer' }}
                  sx={{
                    fontSize: '14px'
                  }}>
                  <MenuItem disabled value="">
                    View Layer
                  </MenuItem>
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
                <Button variant="outlined" onClick={() => setSelectedLayer('')}>
                  Hide Layer
                </Button>
              )}
            </Box>
          </Box>
          {get(errors, name) && (
            <Box mt={1} mb={3} ml={2}>
              <Typography style={{ fontSize: '12px', color: '#f44336' }}>{get(errors, name) as string}</Typography>
            </Box>
          )}
        </Box>
        <Paper variant="outlined">
          <Box position="relative" height={500}>
            <MapContainer
              mapId={mapId}
              drawControls={{
                initialFeatures: get(values, name)
              }}
              onDrawChange={(newGeo: Feature[]) => setFieldValue(name, newGeo)}
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
