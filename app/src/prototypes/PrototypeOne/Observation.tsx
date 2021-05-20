import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { FieldArray, Formik, useFormikContext } from 'formik';
import React from 'react';

export interface IObservationSightings {
  animal: number;
  species: number;
  demographic: number;
  activity: number;
  count: number;
}

export const ObservationSightingsArrayItemInitialValues: IObservationSightings = {
  animal: ('' as unknown) as number,
  species: ('' as unknown) as number,
  demographic: ('' as unknown) as number,
  activity: ('' as unknown) as number,
  count: ('' as unknown) as number
};

export interface IObservationForm {
  gsp_waypoint: number;
  date: string;
  time: string;
  located_via_tracking_device: boolean;
  sightings: IObservationSightings[];
  vegetation_coverage: number;
  vegetation_type: number;
  vegetation_class: number;
  snow_coverage: number;
  comments: string;
}

export const ObservationFormInitialValues: IObservationForm = {
  gsp_waypoint: ('' as unknown) as number,
  date: ('' as unknown) as string,
  time: ('' as unknown) as string,
  located_via_tracking_device: false,
  sightings: [ObservationSightingsArrayItemInitialValues],
  vegetation_coverage: ('' as unknown) as number,
  vegetation_type: ('' as unknown) as number,
  vegetation_class: ('' as unknown) as number,
  snow_coverage: ('' as unknown) as number,
  comments: ''
};

export const FormikTestWrapper: React.FC = () => {
  return (
    <Formik
      key={1}
      initialValues={ObservationFormInitialValues}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={() => {
        // do nothing
      }}>
      <Observation />
    </Formik>
  );
};

const Observation: React.FC = () => {
  const formikProps = useFormikContext<IObservationForm>();

  const { values, touched, errors, handleChange, handleSubmit, getFieldMeta } = formikProps;

  return (
    <form data-testid="observation-form" onSubmit={handleSubmit}>
      <Box component="fieldset">
        <FormLabel id="agency_details" component="legend">
          Add Observation
        </FormLabel>
      </Box>
      <Box component="fieldset" mt={5}>
        <FormLabel component="legend">General Information</FormLabel>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              id="gsp_waypoint"
              name="gsp_waypoint"
              label="GPS Waypoint"
              required={true}
              fullWidth
              variant="outlined"
              value={values.gsp_waypoint}
              onChange={handleChange}
              error={touched.gsp_waypoint && Boolean(errors.gsp_waypoint)}
              helperText={touched.gsp_waypoint && errors.gsp_waypoint}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              id="date"
              name="date"
              label="Date"
              variant="outlined"
              required={true}
              value={values.date}
              type="date"
              onChange={handleChange}
              error={touched.date && Boolean(errors.date)}
              helperText={touched.date && errors.date}
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              id="time"
              name="time"
              label="Start Date"
              variant="outlined"
              required={true}
              value={values.time}
              type="time"
              onChange={handleChange}
              error={touched.time && Boolean(errors.time)}
              helperText={touched.time && errors.time}
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl
              required={true}
              component="fieldset"
              error={touched.located_via_tracking_device && Boolean(errors.located_via_tracking_device)}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.located_via_tracking_device}
                    onChange={handleChange}
                    name="located_via_tracking_device"
                    color="primary"
                  />
                }
                label="Animal(s) located by tracking device."
              />
              <FormHelperText>{errors.located_via_tracking_device}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      <Box component="fieldset" mt={5}>
        <FormLabel component="legend">Sightings</FormLabel>
        <FieldArray
          name="sightings"
          render={(arrayHelpers) => (
            <Box>
              <Grid container direction="row" spacing={3}>
                {values.sightings?.map((sighting, index) => {
                  const animalMeta = getFieldMeta(`sightings.[${index}].animal`);
                  const speciesMeta = getFieldMeta(`sightings.[${index}].species`);
                  const demographicMeta = getFieldMeta(`sightings.[${index}].demographic`);
                  const activityMeta = getFieldMeta(`sightings.[${index}].activity`);
                  const countMeta = getFieldMeta(`sightings.[${index}].count`);
                  return (
                    <Grid item xs={12} key={index}>
                      <Box display="flex">
                        <Box flexBasis="40%">
                          <FormControl variant="outlined" required={true} style={{ width: '100%' }}>
                            <InputLabel id="animal">Animal</InputLabel>
                            <Select
                              id={`sightings.[${index}].animal`}
                              name={`sightings.[${index}].animal`}
                              labelId="animal"
                              label="Animal"
                              value={sighting.animal}
                              onChange={handleChange}
                              error={animalMeta.touched && Boolean(animalMeta.error)}
                              displayEmpty
                              inputProps={{ 'aria-label': 'Animal' }}>
                              <MenuItem key={1} value="1">
                                Animal 1
                              </MenuItem>
                              <MenuItem key={2} value="2">
                                Animal 2
                              </MenuItem>
                              <MenuItem key={3} value="3">
                                Animal 3
                              </MenuItem>
                            </Select>
                            <FormHelperText>{animalMeta.touched && animalMeta.error}</FormHelperText>
                          </FormControl>
                        </Box>
                        <Box flexBasis="40%" pl={1}>
                          <FormControl variant="outlined" required={true} style={{ width: '100%' }}>
                            <InputLabel id="species">Species</InputLabel>
                            <Select
                              id={`sightings.[${index}].species`}
                              name={`sightings.[${index}].species`}
                              labelId="species"
                              label="Species"
                              value={sighting.species}
                              onChange={handleChange}
                              error={speciesMeta.touched && Boolean(speciesMeta.error)}
                              displayEmpty
                              inputProps={{ 'aria-label': 'Species' }}>
                              <MenuItem key={1} value="1">
                                Species 1
                              </MenuItem>
                              <MenuItem key={2} value="2">
                                Species 1
                              </MenuItem>
                              <MenuItem key={3} value="3">
                                Species 1
                              </MenuItem>
                            </Select>
                            <FormHelperText>{speciesMeta.touched && speciesMeta.error}</FormHelperText>
                          </FormControl>
                        </Box>
                        <Box flexBasis="40%" pl={1}>
                          <FormControl variant="outlined" required={true} style={{ width: '100%' }}>
                            <InputLabel id="demographics">Demographics</InputLabel>
                            <Select
                              id={`sightings.[${index}].demographics`}
                              name={`sightings.[${index}].demographics`}
                              labelId="demographics"
                              label="Demographic"
                              value={sighting.species}
                              onChange={handleChange}
                              error={demographicMeta.touched && Boolean(demographicMeta.error)}
                              displayEmpty
                              inputProps={{ 'aria-label': 'Demographic' }}>
                              <MenuItem key={1} value="1">
                                Demographic 1
                              </MenuItem>
                              <MenuItem key={2} value="2">
                                Demographic 2
                              </MenuItem>
                              <MenuItem key={3} value="3">
                                Demographic 3
                              </MenuItem>
                            </Select>
                            <FormHelperText>{demographicMeta.touched && demographicMeta.error}</FormHelperText>
                          </FormControl>
                        </Box>
                        <Box flexBasis="40%" pl={1}>
                          <FormControl variant="outlined" required={true} style={{ width: '100%' }}>
                            <InputLabel id="activity">Activity</InputLabel>
                            <Select
                              id={`sightings.[${index}].activity`}
                              name={`sightings.[${index}].activity`}
                              labelId="activity"
                              label="Activity"
                              value={sighting.activity}
                              onChange={handleChange}
                              error={activityMeta.touched && Boolean(activityMeta.error)}
                              displayEmpty
                              inputProps={{ 'aria-label': 'Demographic' }}>
                              <MenuItem key={1} value="1">
                                Activity 1
                              </MenuItem>
                              <MenuItem key={2} value="2">
                                Activity 2
                              </MenuItem>
                              <MenuItem key={3} value="3">
                                Activity 3
                              </MenuItem>
                            </Select>
                            <FormHelperText>{activityMeta.touched && activityMeta.error}</FormHelperText>
                          </FormControl>
                        </Box>
                        <Box flexBasis="20%" pl={1}>
                          <TextField
                            id="count"
                            name="count"
                            label="Count"
                            required={true}
                            fullWidth
                            variant="outlined"
                            value={sighting.count}
                            onChange={handleChange}
                            error={countMeta.touched && Boolean(countMeta.error)}
                            helperText={countMeta.touched && countMeta.error}
                          />
                        </Box>
                        <Box pt={0.5} pl={1}>
                          <IconButton
                            color="primary"
                            data-testid="delete-icon"
                            aria-label="remove sighting"
                            onClick={() => arrayHelpers.remove(index)}>
                            <Icon path={mdiTrashCanOutline} size={1} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
              <Box pt={2}>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  aria-label="add sighting"
                  onClick={() => arrayHelpers.push(ObservationSightingsArrayItemInitialValues)}>
                  Add
                </Button>
              </Box>
            </Box>
          )}
        />
      </Box>
      <Box component="fieldset" mt={5}>
        <FormLabel component="legend">Habitat</FormLabel>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              id="vegetation_coverage"
              name="vegetation_coverage"
              label="Vegetation Coverage"
              required={true}
              fullWidth
              variant="outlined"
              value={values.vegetation_coverage}
              onChange={handleChange}
              error={touched.vegetation_coverage && Boolean(errors.vegetation_coverage)}
              helperText={touched.vegetation_coverage && errors.vegetation_coverage}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
              <InputLabel id="vegetation_type-label">Vegetation Type</InputLabel>
              <Select
                id="vegetation_type"
                name="vegetation_type"
                labelId="vegetation_type-label"
                label="Vegetation Type"
                value={values.vegetation_type}
                labelWidth={300}
                onChange={handleChange}
                error={touched.vegetation_type && Boolean(errors.vegetation_type)}
                displayEmpty
                inputProps={{ 'aria-label': 'Vegetation Type' }}>
                <MenuItem key={1} value="1">
                  Type 1
                </MenuItem>
                <MenuItem key={2} value="2">
                  Type 2
                </MenuItem>
                <MenuItem key={3} value="3">
                  Type 3
                </MenuItem>
              </Select>
              <FormHelperText>{touched.vegetation_type && errors.vegetation_type}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
              <InputLabel id="vegetation_class-label">Vegetation Class</InputLabel>
              <Select
                id="vegetation_class"
                name="vegetation_class"
                labelId="vegetation_class-label"
                label="Vegetation Class"
                value={values.vegetation_class}
                labelWidth={300}
                onChange={handleChange}
                error={touched.vegetation_class && Boolean(errors.vegetation_class)}
                displayEmpty
                inputProps={{ 'aria-label': 'Vegetation Class' }}>
                <MenuItem key={1} value="Class 1">
                  Veg Class 1
                </MenuItem>
                <MenuItem key={2} value="Class 2">
                  Veg Class 2
                </MenuItem>
                <MenuItem key={3} value="Class 3">
                  Veg Class 3
                </MenuItem>
              </Select>
              <FormHelperText>{touched.vegetation_class && errors.vegetation_class}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
              <InputLabel id="snow_coverage-label">Snow Coverage</InputLabel>
              <Select
                id="snow_coverage"
                name="snow_coverage"
                labelId="snow_coverage-label"
                label="Snow Coverage"
                value={values.snow_coverage}
                labelWidth={300}
                onChange={handleChange}
                error={touched.snow_coverage && Boolean(errors.snow_coverage)}
                displayEmpty
                inputProps={{ 'aria-label': 'Snow Coverage' }}>
                <MenuItem key={1} value="1">
                  Snow Coverage 1
                </MenuItem>
                <MenuItem key={2} value="2">
                  Snow Coverage 2
                </MenuItem>
                <MenuItem key={3} value="3">
                  Snow Coverage 3
                </MenuItem>
              </Select>
              <FormHelperText>{touched.snow_coverage && errors.snow_coverage}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      <Box component="fieldset" mt={5}>
        <FormLabel component="legend">Optional Fields</FormLabel>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              id="comments"
              name="comments"
              label="Comments"
              multiline
              required={true}
              rows={4}
              fullWidth
              variant="outlined"
              value={values.comments}
              onChange={handleChange}
              error={touched.comments && Boolean(errors.comments)}
              helperText={touched.comments && errors.comments}
            />
          </Grid>
        </Grid>
      </Box>
      <Box mt={4}>
        <Divider />
      </Box>
    </form>
  );
};

export default Observation;
