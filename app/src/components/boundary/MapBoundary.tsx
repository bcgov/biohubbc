import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import Button from '@material-ui/core/Button';
import { v4 as uuidv4 } from 'uuid';
import MapContainer from 'components/map/MapContainer';
import { Feature } from 'geojson';
import { handleKMLUpload, handleShapefileUpload } from 'utils/mapBoundaryUploadHelpers';

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
  setFieldValue: (key: string, value: any) => void;
}

/**
 * Shared component for map boundary component
 *
 * @return {*}
 */
const MapBoundary: React.FC<IMapBoundaryProps> = (props) => {
  const classes = useStyles();
  const { title, mapId, isLoading, setIsLoading, uploadError, setUploadError, values, bounds, setFieldValue } = props;

  return (
    <Grid item xs={12}>
      <Typography className={classes.bold}>{title}</Typography>
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
        />
      </Box>
    </Grid>
  );
};

export default MapBoundary;
