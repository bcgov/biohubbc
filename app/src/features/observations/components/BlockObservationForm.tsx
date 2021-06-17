import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import { DATE_LIMIT } from 'constants/dateTimeFormats';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.min.css';
import yup from 'utils/YupSchema';

const useStyles = makeStyles(() => ({
  customGridContainer: {
    marginTop: '2px !important',
    marginBottom: '0 !important'
  }
}));

export interface IBlockObservationForm {
  block_name: number;
  block_size: number;
  strata: string;
  date: string;
  start_time: string;
  end_time: string;
  pilot_name: string;
  navigator: string;
  rear_left_observer: string;
  rear_right_observer: string;
  visibility: string;
  light: string;
  cloud_cover: number;
  temperature: number;
  precipitation: string;
  wind_speed: number;
  snow_cover: number;
  snow_depth: number;
  days_since_snowfall: number;
  weather_description: string;
  description_of_habitat: string;
  aircraft_company: string;
  aircraft_type: string;
  aircraft_registration_number: number;
  aircraft_gps_model: string;
  aircraft_gps_datum: string;
  aircraft_gps_readout: string;
}

export const BlockObservationInitialValues: IBlockObservationForm = {
  block_name: ('' as unknown) as number,
  block_size: ('' as unknown) as number,
  strata: '',
  date: '',
  start_time: '',
  end_time: '',
  pilot_name: '',
  navigator: '',
  rear_left_observer: '',
  rear_right_observer: '',
  visibility: '',
  light: '',
  cloud_cover: ('' as unknown) as number,
  temperature: ('' as unknown) as number,
  precipitation: '',
  wind_speed: ('' as unknown) as number,
  snow_cover: ('' as unknown) as number,
  snow_depth: ('' as unknown) as number,
  days_since_snowfall: ('' as unknown) as number,
  weather_description: '',
  description_of_habitat: '',
  aircraft_company: '',
  aircraft_type: '',
  aircraft_registration_number: ('' as unknown) as number,
  aircraft_gps_model: '',
  aircraft_gps_datum: '',
  aircraft_gps_readout: ''
};

export const BlockObservationYupSchema = yup.object().shape({
  block_name: yup.number().min(1, 'required').required('Required'),
  date: yup.string().isValidDateString().required('Required'),
  start_time: yup.string().required('Required'),
  end_time: yup.string().required('Required')
});

export interface IBlockObservationFormProps {
  tableRef: any;
  tableData: any[][];
}

/**
 * Create block observation form
 *
 * @return {*}
 */
const BlockObservationForm: React.FC<IBlockObservationFormProps> = (props) => {
  const classes = useStyles();

  const formikProps = useFormikContext<IBlockObservationForm>();
  const { values, touched, errors, handleChange } = formikProps;

  // Currently hard-coded to moose observation form fields
  const tableHeaders = [
    ['WPT', { label: 'Bulls', colspan: 3 }, { label: 'Cows', colspan: 3 }],
    [
      '',
      'Yrlings',
      'Mature',
      'Unclass',
      'Lone',
      'W/1 Calf',
      'W/2 Calf',
      'Lone Calf',
      'Unclass',
      'TOTAL',
      'Activity',
      '% Veg Cover',
      '% Snow',
      'Comments'
    ]
  ];

  // Currently hard-coded to moose observation form fields
  const [tableSettings] = useState<Handsontable.GridSettings>({
    nestedHeaders: tableHeaders,
    viewportRowRenderingOffset: 'auto',
    minRows: 8,
    contextMenu: true,
    rowHeaders: false,
    search: true,
    width: '100%',
    height: '100%',
    rowHeights: 40,
    colWidths: 84,
    readOnly: false,
    columnSorting: true,
    formulas: true,
    columns: [
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric', readOnly: true },
      { type: 'dropdown', source: ['Bedded', 'Moving', 'Standing'] },
      {
        type: 'dropdown',
        source: [
          '0',
          '5',
          '10',
          '15',
          '20',
          '25',
          '30',
          '35',
          '40',
          '45',
          '50',
          '55',
          '60',
          '65',
          '70',
          '75',
          '80',
          '85',
          '90',
          '95',
          '100'
        ]
      },
      { type: 'numeric' },
      { type: 'text', width: 245 }
    ]
  });

  return (
    <form>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box component="fieldset" mt={3}>
            <Box component="legend" mb={1}>
              <b>Block Information</b>
            </Box>
            <Grid container spacing={2} className={classes.customGridContainer}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  required={true}
                  id="block_name"
                  size="small"
                  name="block_name"
                  label="Block ID"
                  variant="outlined"
                  value={values.block_name}
                  onChange={handleChange}
                  error={touched.block_name && Boolean(errors.block_name)}
                  helperText={touched.block_name && errors.block_name}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  required={false}
                  size="small"
                  id="block_size"
                  name="block_size"
                  label={`Block Size (km\u00B2)`}
                  variant="outlined"
                  value={values.block_size}
                  onChange={handleChange}
                  error={touched.block_size && Boolean(errors.block_size)}
                  helperText={touched.block_size && errors.block_size}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth variant="outlined" required={false} size="small">
                  <InputLabel id="strata_label">Strata</InputLabel>
                  <Select
                    id="strata"
                    name="strata"
                    labelId="strata_label"
                    label="Strata"
                    value={values.strata}
                    onChange={handleChange}
                    error={touched.strata && Boolean(errors.strata)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'strata' }}>
                    {['High', 'Medium', 'Low', 'Very Low'].map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{touched.strata && errors.strata}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  id="date"
                  name="date"
                  label="Date"
                  size="small"
                  variant="outlined"
                  required={true}
                  value={values.date}
                  type="date"
                  InputProps={{
                    // Chrome min/max dates
                    inputProps: { min: DATE_LIMIT.min, max: DATE_LIMIT.max, 'data-testid': 'date' }
                  }}
                  inputProps={{
                    // Firefox min/max dates
                    min: DATE_LIMIT.min,
                    max: DATE_LIMIT.max,
                    'data-testid': 'date'
                  }}
                  onChange={handleChange}
                  error={touched.date && Boolean(errors.date)}
                  helperText={touched.date && errors.date}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  id="start_time"
                  name="start_time"
                  label="Start Time"
                  variant="outlined"
                  size="small"
                  required={true}
                  value={values.start_time}
                  type="time"
                  inputProps={{
                    step: 300 // 5 min
                  }}
                  onChange={handleChange}
                  error={touched.start_time && Boolean(errors.start_time)}
                  helperText={touched.start_time && errors.start_time}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  id="end_time"
                  name="end_time"
                  label="End Time"
                  size="small"
                  variant="outlined"
                  required={true}
                  value={values.end_time}
                  type="time"
                  inputProps={{
                    step: 300 // 5 min
                  }}
                  onChange={handleChange}
                  error={touched.end_time && Boolean(errors.end_time)}
                  helperText={touched.end_time && errors.end_time}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box component="fieldset" mt={3}>
            <Box component="legend" mb={1}>
              <b>Flight Information</b>
            </Box>
            <Grid container spacing={2} className={classes.customGridContainer}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required={false}
                  id="pilot_name"
                  name="pilot_name"
                  size="small"
                  label="Pilot"
                  variant="outlined"
                  value={values.pilot_name}
                  onChange={handleChange}
                  error={touched.pilot_name && Boolean(errors.pilot_name)}
                  helperText={touched.pilot_name && errors.pilot_name}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required={false}
                  id="navigator"
                  name="navigator"
                  label="Navigator"
                  size="small"
                  variant="outlined"
                  value={values.navigator}
                  onChange={handleChange}
                  error={touched.navigator && Boolean(errors.navigator)}
                  helperText={touched.navigator && errors.navigator}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required={false}
                  id="rear_left_observer"
                  name="rear_left_observer"
                  label="Rear Left Observer"
                  size="small"
                  variant="outlined"
                  value={values.rear_left_observer}
                  onChange={handleChange}
                  error={touched.rear_left_observer && Boolean(errors.rear_left_observer)}
                  helperText={touched.rear_left_observer && errors.rear_left_observer}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required={false}
                  id="rear_right_observer"
                  name="rear_right_observer"
                  label="Rear Right Observer"
                  size="small"
                  variant="outlined"
                  value={values.rear_right_observer}
                  onChange={handleChange}
                  error={touched.rear_right_observer && Boolean(errors.rear_right_observer)}
                  helperText={touched.rear_right_observer && errors.rear_right_observer}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box component="fieldset" mt={3}>
            <Box component="legend" mb={1}>
              <b>Conditions</b>
            </Box>
            <Grid container spacing={2} className={classes.customGridContainer}>
              <Grid item xs={4}>
                <FormControl fullWidth variant="outlined" required={false} size="small">
                  <InputLabel id="visibility-label">Visibility</InputLabel>
                  <Select
                    id="visibility"
                    name="visibility"
                    labelId="visibility-label"
                    label="Visibility"
                    value={values.visibility}
                    labelWidth={300}
                    onChange={handleChange}
                    error={touched.visibility && Boolean(errors.visibility)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'visibility' }}>
                    {['Very Poor', 'Moderate', 'Good', 'Very Good'].map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{touched.visibility && errors.visibility}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth variant="outlined" required={false} size="small">
                  <InputLabel id="light-label">Light</InputLabel>
                  <Select
                    id="light"
                    name="light"
                    labelId="light-label"
                    label="Light"
                    value={values.light}
                    labelWidth={300}
                    onChange={handleChange}
                    error={touched.light && Boolean(errors.light)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'light' }}>
                    {['Bright', 'Flat'].map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{touched.light && errors.light}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  required={false}
                  id="cloud_cover"
                  name="cloud_cover"
                  label="Cloud Cover"
                  size="small"
                  variant="outlined"
                  value={values.cloud_cover}
                  onChange={handleChange}
                  error={touched.cloud_cover && Boolean(errors.cloud_cover)}
                  helperText={touched.cloud_cover && errors.cloud_cover}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.customGridContainer}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  required={false}
                  id="temperature"
                  name="temperature"
                  size="small"
                  label={`Temperature`}
                  variant="outlined"
                  value={values.temperature}
                  onChange={handleChange}
                  error={touched.temperature && Boolean(errors.temperature)}
                  helperText={touched.temperature && errors.temperature}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth variant="outlined" required={false} size="small">
                  <InputLabel id="precipitation-label">Precipitation</InputLabel>
                  <Select
                    id="precipitation"
                    name="precipitation"
                    labelId="precipitation-label"
                    label="Precipitation"
                    value={values.precipitation}
                    labelWidth={300}
                    onChange={handleChange}
                    error={touched.precipitation && Boolean(errors.precipitation)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'precipitation' }}>
                    {[
                      'None',
                      'Fog',
                      'Misty drizzle',
                      'Drizzle',
                      'Light Rain',
                      'Hard Rain',
                      'Snow',
                      'Light Snow',
                      'Heavy Snow',
                      'Freezing'
                    ].map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{touched.precipitation && errors.precipitation}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  required={false}
                  id="wind_speed"
                  name="wind_speed"
                  size="small"
                  label="Wind Speed"
                  variant="outlined"
                  value={values.wind_speed}
                  onChange={handleChange}
                  error={touched.wind_speed && Boolean(errors.wind_speed)}
                  helperText={touched.wind_speed && errors.wind_speed}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.customGridContainer}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  required={false}
                  id="snow_cover"
                  name="snow_cover"
                  size="small"
                  label="Snow Cover"
                  variant="outlined"
                  value={values.snow_cover}
                  onChange={handleChange}
                  error={touched.snow_cover && Boolean(errors.snow_cover)}
                  helperText={touched.snow_cover && errors.snow_cover}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  required={false}
                  id="snow_depth"
                  name="snow_depth"
                  size="small"
                  label="Snow Depth"
                  variant="outlined"
                  value={values.snow_depth}
                  onChange={handleChange}
                  error={touched.snow_depth && Boolean(errors.snow_depth)}
                  helperText={touched.snow_depth && errors.snow_depth}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  required={false}
                  id="days_since_snowfall"
                  name="days_since_snowfall"
                  size="small"
                  label="Days Since Snowfall"
                  variant="outlined"
                  value={values.days_since_snowfall}
                  onChange={handleChange}
                  error={touched.days_since_snowfall && Boolean(errors.days_since_snowfall)}
                  helperText={touched.days_since_snowfall && errors.days_since_snowfall}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box component="fieldset" mt={3}>
            <Box component="legend" mb={1}>
              <b>Aircraft Details</b>
            </Box>
            <Grid container spacing={2} className={classes.customGridContainer}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  required={false}
                  id="aircraft_company"
                  name="aircraft_company"
                  size="small"
                  label="Company"
                  variant="outlined"
                  value={values.aircraft_company}
                  onChange={handleChange}
                  error={touched.aircraft_company && Boolean(errors.aircraft_company)}
                  helperText={touched.aircraft_company && errors.aircraft_company}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  required={false}
                  id="aircraft_type"
                  name="aircraft_type"
                  size="small"
                  label="Aircraft Type"
                  variant="outlined"
                  value={values.aircraft_type}
                  onChange={handleChange}
                  error={touched.aircraft_type && Boolean(errors.aircraft_type)}
                  helperText={touched.aircraft_type && errors.aircraft_type}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  required={false}
                  id="aircraft_registration_number"
                  name="aircraft_registration_number"
                  size="small"
                  label="Call Sign"
                  variant="outlined"
                  value={values.aircraft_registration_number}
                  onChange={handleChange}
                  error={touched.aircraft_registration_number && Boolean(errors.aircraft_registration_number)}
                  helperText={touched.aircraft_registration_number && errors.aircraft_registration_number}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  required={false}
                  id="aircraft_gps_model"
                  name="aircraft_gps_model"
                  size="small"
                  label="GPS Model"
                  variant="outlined"
                  value={values.aircraft_gps_model}
                  onChange={handleChange}
                  error={touched.aircraft_gps_model && Boolean(errors.aircraft_gps_model)}
                  helperText={touched.aircraft_gps_model && errors.aircraft_gps_model}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth variant="outlined" required={false} size="small">
                  <InputLabel id="aircraft_gps_datum-label">GPS Datum</InputLabel>
                  <Select
                    id="aircraft_gps_datum"
                    name="aircraft_gps_datum"
                    labelId="aircraft_gps_datum-label"
                    label="GPS Datum"
                    value={values.aircraft_gps_datum}
                    labelWidth={300}
                    onChange={handleChange}
                    error={touched.aircraft_gps_datum && Boolean(errors.aircraft_gps_datum)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'aircraft_gps_datum' }}>
                    {['NAD27', 'NAD83', 'WGS84'].map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{touched.aircraft_gps_datum && errors.aircraft_gps_datum}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth variant="outlined" required={false} size="small">
                  <InputLabel id="aircraft_gps_readout-label">Readout</InputLabel>
                  <Select
                    id="aircraft_gps_readout"
                    name="aircraft_gps_readout"
                    labelId="aircraft_gps_readout-label"
                    label="Readout"
                    value={values.aircraft_gps_readout}
                    labelWidth={300}
                    onChange={handleChange}
                    error={touched.aircraft_gps_readout && Boolean(errors.aircraft_gps_readout)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'aircraft_gps_readout' }}>
                    {['Decimal Degrees', 'Degrees Decimal Minutes', 'Degrees Minutes Seconds', 'UTM'].map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{touched.aircraft_gps_readout && errors.aircraft_gps_readout}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <Box component="fieldset" mt={3}>
        <Box component="legend" mb={1}>
          <b>Comments</b>
        </Box>
        <Grid container spacing={2} className={classes.customGridContainer}>
          <Grid item xs={12}>
            <TextField
              id="weather_description"
              name="weather_description"
              label="Weather Description"
              size="small"
              multiline
              required={false}
              rows={2}
              fullWidth
              variant="outlined"
              value={values.weather_description}
              onChange={handleChange}
              error={touched.weather_description && Boolean(errors.weather_description)}
              helperText={touched.weather_description && errors.weather_description}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="description_of_habitat"
              name="description_of_habitat"
              label="Description of Habitat"
              size="small"
              multiline
              required={false}
              rows={2}
              fullWidth
              variant="outlined"
              value={values.description_of_habitat}
              onChange={handleChange}
              error={touched.description_of_habitat && Boolean(errors.description_of_habitat)}
              helperText={touched.description_of_habitat && errors.description_of_habitat}
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="fieldset" mt={3}>
        <Box component="legend" mb={1}>
          <b>Observations</b>
        </Box>
        <Grid container spacing={2} className={classes.customGridContainer}>
          <Grid item xs={12}>
            <Box style={{ height: '400px' }}>
              <HotTable
                id="hot"
                ref={props.tableRef}
                data={props.tableData}
                settings={tableSettings}
                licenseKey="non-commercial-and-evaluation"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default BlockObservationForm;
