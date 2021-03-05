import { Grid, TextField, Box, Typography, Button } from '@material-ui/core';
import {
  default as MultiAutocompleteFieldVariableSize,
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { useFormikContext } from 'formik';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import * as yup from 'yup';
//@ts-ignore
import { kml } from '@tmcw/togeojson';
import bbox from '@turf/bbox';
import MapContainer from 'components/map/MapContainer';
import { Feature } from 'geojson';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

export interface IProjectLocationForm {
  regions: string[];
  location_description: string;
}

export const ProjectLocationFormInitialValues: IProjectLocationForm = {
  regions: [],
  location_description: ''
};

export const ProjectLocationFormYupSchema = yup.object().shape({
  regions: yup.array().of(yup.string()).min(1).required('Required'),
  location_description: yup.string()
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

  const { values, touched, errors, handleChange, handleSubmit } = formikProps;

  const [bounds, setBounds] = useState<any>([]);
  const [geometry, setGeometry] = useState<Feature[]>([]);

  const handleSpatialUpload = async (e: any) => {
    const file = e.target.files[0];
    const fileAsString = await file.text().then((xmlString: string) => {
      return xmlString;
    });
    const domKml = new DOMParser().parseFromString(fileAsString, 'application/xml');
    const geojson = kml(domKml);
    const bboxCoords = bbox(geojson);

    setBounds([
      [bboxCoords[1], bboxCoords[0]],
      [bboxCoords[3], bboxCoords[2]]
    ]);
    setGeometry(geojson.features);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize id={'regions'} label={'Regions'} options={props.region} required={true} />
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
            helperText={errors.location_description}
            InputLabelProps={{
              shrink: true
            }}
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
              style={{ border: '2px solid', textTransform: 'capitalize', fontWeight: 'bold' }}>
              <input type="file" hidden onChange={(e) => handleSpatialUpload(e)} />
              Upload KML
            </Button>
          </Box>
          <Box mt={5} height={500}>
            {!geometry.length && <MapContainer mapId="project_location_form_map" />}
            {geometry.length > 0 && (
              <MapContainer
                mapId="project_location_form_map"
                geometryState={{ geometry, setGeometry }}
                bounds={bounds}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectLocationForm;
