import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
//@ts-ignore
import { kml } from '@tmcw/togeojson';
import shp from 'shpjs';
import bbox from '@turf/bbox';
import {
  default as MultiAutocompleteFieldVariableSize,
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import MapContainer from 'components/map/MapContainer';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useEffect, useState } from 'react';
import yup from 'utils/YupSchema';
import { v4 as uuidv4 } from 'uuid';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

export interface IProjectLocationForm {
  regions: string[];
  location_description: string;
  geometry: Feature[];
}

export const ProjectLocationFormInitialValues: IProjectLocationForm = {
  regions: [],
  location_description: '',
  geometry: []
};

export const ProjectLocationFormYupSchema = yup.object().shape({
  regions: yup.array().of(yup.string()).min(1, 'Required').required('Required'),
  location_description: yup.string().max(3000, 'Cannot exceed 3000 characters')
});

export interface IProjectLocationFormProps {
  region: IMultiAutocompleteFieldOption[];
}

/**
 * Create project - Location section
 *
 * @return {*}
 */
const ProjectLocationForm: React.FC<IProjectLocationFormProps> = (props) => {
  const classes = useStyles();

  const formikProps = useFormikContext<IProjectLocationForm>();

  const { values, touched, errors, handleChange, handleSubmit, setFieldValue } = formikProps;

  const [bounds, setBounds] = useState<any>([]);
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);

    /*
      If no geometries, we do not need to set bounds

      If there is only one geometry and it is a point, we cannot do the bound setting
      because leaflet does not know how to handle that and tries to zoom in way too much

      If there are multiple points or a polygon and a point, this is not an issue
    */
    if (!values.geometry.length || (values.geometry.length === 1 && values.geometry[0].geometry.type === 'Point')) {
      return;
    }

    const allGeosFeatureCollection = {
      type: 'FeatureCollection',
      features: [...values.geometry]
    };
    const bboxCoords = bbox(allGeosFeatureCollection);

    setBounds([
      [bboxCoords[1], bboxCoords[0]],
      [bboxCoords[3], bboxCoords[2]]
    ]);
  }, [values.geometry]);

  const handleShapefileUpload = async (e: any) => {
    const file = e.target.files[0];
    console.log(file);

    if (file?.type !== 'application/zip') {
      console.log('No thanks');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      // console.log(e?.target?.result);
      const zipString: string = (e?.target?.result || "") as string;
      
      // console.log('zipString',zipString)
      // console.log('zipString',typeof zipString)
      const zip = new TextEncoder().encode(zipString);
      console.log(typeof zip);
      // console.log(typeof zip);
      shp.parseZip(zip).then((geojson) => {
        console.log('geojson',geojson);
      }).catch((err) => {
        console.error('fail',err);
      });
    }


  }

  const handleKMLUpload = async (e: any) => {
    setIsLoading(true);

    const file = e.target.files[0];
    const fileAsString = await file?.text().then((xmlString: string) => {
      return xmlString;
    });

    if (file?.type !== 'application/vnd.google-earth.kml+xml' && !fileAsString?.includes('</kml>')) {
      setUploadError('You must upload a KML file, please try again.');
      setIsLoading(false);
      return;
    }

    const domKml = new DOMParser().parseFromString(fileAsString, 'application/xml');
    const geojson = kml(domKml);

    let sanitizedGeoJSON: Feature[] = [];
    geojson.features.forEach((feature: Feature) => {
      if (feature.geometry) {
        sanitizedGeoJSON.push(feature);
      }
    });

    setFieldValue('geometry', [...sanitizedGeoJSON, ...values.geometry]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize id={'regions'} label={'Regions'} options={props.region} required={true} />
          <Box pt={2}>
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                window.open(
                  'https://www2.gov.bc.ca/gov/content/industry/forestry/managing-our-forest-resources/ministry-of-forests-lands-and-natural-resource-operations-region-district-contacts'
                );
              }}>
              Click here to view FLNRO map regions.
            </Link>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="location_description"
            name="location_description"
            label="Location Description"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={values.location_description}
            onChange={handleChange}
            error={touched.location_description && Boolean(errors.location_description)}
            helperText={touched.location_description && errors.location_description}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography className={classes.bold}>Project Boundary</Typography>
          <Box display="flex" mt={3}>
            <Button
              variant="outlined"
              component="label"
              size="medium"
              color="primary"
              disabled={isLoading}
              onClick={() => setUploadError('')}
              style={{ border: '2px solid', textTransform: 'capitalize', fontWeight: 'bold' }}>
              <input
                key={uuidv4()}
                data-testid="file-upload"
                type="file"
                hidden
                onChange={(e) => handleKMLUpload(e)}
              />
              Upload KML
            </Button>
            <Tooltip
              arrow
              color='secondary'
              title='Will only accept zipped shapefiles of projection BC Albers.'
            >
              <Button
                variant="outlined"
                component="label"
                size="medium"
                color="primary"
                disabled={isLoading}
                style={{
                  marginLeft:'1rem',
                  border: '2px solid',
                  textTransform: 'capitalize',
                  fontWeight: 'bold'
                }}
              >
                <input
                  key={uuidv4()}
                  data-testid="shp-upload"
                  type="file"
                  hidden
                  onChange={(e) => handleShapefileUpload(e)}
                />
                Upload Shapefile
              </Button>

            </Tooltip>
          </Box>
          <Box mt={2}>{uploadError && <Typography style={{ color: '#db3131' }}>{uploadError}</Typography>}</Box>
          <Box mt={5} height={500}>
            <MapContainer
              mapId="project_location_form_map"
              //@ts-ignore
              geometryState={{
                geometry: values.geometry,
                setGeometry: (newGeo: Feature[]) => setFieldValue('geometry', newGeo)
              }}
              bounds={bounds}
            />
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectLocationForm;
