import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import { mdiTrayArrowUp } from '@mdi/js';
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

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  },
  uploadButton: {
    border: '2px solid',
    textTransform: 'capitalize',
    fontWeight: 'bold'
  },
  mapLocations: {
    '& dd': {
      display: 'inline-block'
    }
  }
});

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
        dialogTitle="Upload Boundary"
        onClose={() => setOpenUploadBoundary(false)}>
        <Box>
          <Box mb={3}>
            <Alert severity="info">If uploading a shapefile, it must be configured with a valid projection.</Alert>
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
        <Typography className={classes.bold}>{title}</Typography>
        <Box mt={2}>
          <Typography variant="body1">
            Define your boundary by selecting a boundary from an existing layer or by uploading KML file or shapefile.
          </Typography>
          <Box mt={2}>
            <Typography variant="body1">
              To select a boundary from an existing layer, select a layer from the dropdown, click a boundary on the map
              and click 'Add Boundary'.
            </Typography>
          </Box>
        </Box>
        <Box display="flex" mt={3}>
          <Button
            color="primary"
            data-testid="boundary_file-upload"
            variant="outlined"
            startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
            onClick={() => setOpenUploadBoundary(true)}>
            Upload Boundary
          </Button>
          <Box flexBasis="35%" pl={2}>
            <FormControl variant="outlined" style={{ width: '100%' }}>
              <InputLabel id="layer">Select Layer</InputLabel>
              <Select
                id="layer"
                name="layer"
                labelId="layer"
                label="Select Layer"
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
          {selectedLayer && (
            <Button
              variant="outlined"
              component="label"
              size="medium"
              color="primary"
              onClick={() => setSelectedLayer('')}
              className={classes.uploadButton}
              style={{ marginLeft: '1rem' }}>
              Hide Layer
            </Button>
          )}
        </Box>
        <Box mt={2}>
          {get(errors, name) && <Typography style={{ color: '#f44336' }}>{get(errors, name)}</Typography>}
        </Box>
        <Box mt={5} height={500}>
          <MapContainer
            mapId={mapId}
            geometryState={{
              geometry: values.geometry,
              setGeometry: (newGeo: Feature[]) => setFieldValue(name, newGeo)
            }}
            bounds={(shouldUpdateBounds && updatedBounds) || bounds}
            selectedLayer={selectedLayer}
            setInferredLayersInfo={setInferredLayersInfo}
          />
        </Box>
        {get(errors, name) && (
          <Box pt={2}>
            <Typography style={{ fontSize: '12px', color: '#f44336' }}>{get(errors, name)}</Typography>
          </Box>
        )}
        {values.geometry && values.geometry.length > 0 && (
          <Box pt={2}>
            <Button
              variant="outlined"
              component="label"
              size="medium"
              color="primary"
              onClick={() => {
                setUpdatedBounds(calculateUpdatedMapBounds(values.geometry));
                setShouldUpdateBounds(true);
              }}
              className={classes.uploadButton}>
              Zoom to Boundary Extent
            </Button>
          </Box>
        )}
        {!Object.values(inferredLayersInfo).every((item: any) => !item.length) && (
          <>
            <Box mt={4}>
              <Typography className={classes.bold}>Boundary Information</Typography>
            </Box>
            <dl>
              <InferredLocationDetails layers={inferredLayersInfo} />
            </dl>
          </>
        )}
      </Grid>
    </>
  );
};

export default MapBoundary;
