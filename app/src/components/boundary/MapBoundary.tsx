import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { v4 as uuidv4 } from 'uuid';
import MapContainer from 'components/map/MapContainer';
import { Feature } from 'geojson';
import { handleKMLUpload, handleShapefileUpload } from 'utils/mapBoundaryUploadHelpers';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  },
  uploadButton: {
    border: '2px solid',
    textTransform: 'capitalize',
    fontWeight: 'bold'
  }
});

export interface IMapBoundaryProps {
  title: string;
  mapId: string;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  uploadError: string;
  setUploadError: (error: string) => void;
  values: any;
  bounds: any[];
  errors?: any;
  setFieldValue: (key: string, value: any) => void;
}

/**
 * Shared component for map boundary component
 *
 * @return {*}
 */
const MapBoundary: React.FC<IMapBoundaryProps> = (props) => {
  const classes = useStyles();
  const {
    title,
    mapId,
    isLoading,
    setIsLoading,
    uploadError,
    setUploadError,
    values,
    bounds,
    setFieldValue,
    errors
  } = props;

  const [selectedLayer, setSelectedLayer] = useState('');

  return (
    <Grid item xs={12}>
      <Typography className={classes.bold}>{title}</Typography>
      <Box mt={2}>
        <Typography variant="body2">
          You may select a boundary from an existing layer or upload a KML or Shapefile, KMZ files will not be accepted.
          The Shapefile being uploaded must be configured with a valid projection. To select a boundary from an existing
          layer, toggle the appropriate layer and select a boundary from the map, then press add boundary. When done,
          press the hide layer button.
        </Typography>
      </Box>
      <Box display="flex" mt={3}>
        <Tooltip arrow color="secondary" title="Will only accept kml files, kmz files not accepted.">
          <Button
            variant="outlined"
            component="label"
            size="medium"
            color="primary"
            disabled={isLoading}
            onClick={() => setUploadError('')}
            className={classes.uploadButton}>
            <input
              key={uuidv4()}
              data-testid="file-upload"
              type="file"
              hidden
              onChange={(e) => handleKMLUpload(e, setIsLoading, setUploadError, values, setFieldValue)}
            />
            Upload KML
          </Button>
        </Tooltip>
        <Tooltip arrow color="secondary" title="Will only accept zipped shapefiles of a known projection.">
          <Button
            variant="outlined"
            component="label"
            size="medium"
            color="primary"
            disabled={isLoading}
            onClick={() => setUploadError('')}
            className={classes.uploadButton}
            style={{ marginLeft: '1rem' }}>
            <input
              key={uuidv4()}
              data-testid="shp-upload"
              type="file"
              hidden
              onChange={(e) => handleShapefileUpload(e, values, setFieldValue, setUploadError)}
            />
            Upload Shapefile
          </Button>
        </Tooltip>
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
      </Box>
      <Box mt={2}>{uploadError && <Typography style={{ color: '#db3131' }}>{uploadError}</Typography>}</Box>
      <Box mt={5} height={500}>
        <MapContainer
          mapId={mapId}
          //@ts-ignore
          geometryState={{
            geometry: values.geometry,
            setGeometry: (newGeo: Feature[]) => setFieldValue('geometry', newGeo)
          }}
          bounds={bounds}
          selectedLayer={selectedLayer}
        />
      </Box>
      {errors && errors.geometry && (
        <Box pt={2}>
          <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.geometry}</Typography>
        </Box>
      )}
    </Grid>
  );
};

export default MapBoundary;
