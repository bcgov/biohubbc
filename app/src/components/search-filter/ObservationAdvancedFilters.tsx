import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';

export interface IObservationAdvancedFilters {
  keyword: string;
  project_name: string;
  start_date: string;
  end_date: string;
  regions: string[];
  agency_id: number;
  agency_project_id: string;
  species: number[];
}

export const ObservationAdvancedFiltersInitialValues: IObservationAdvancedFilters = {
  keyword: '',
  project_name: '',
  start_date: '',
  end_date: '',
  regions: [],
  agency_id: ('' as unknown) as number,
  agency_project_id: '',
  species: []
};

export interface IObservationAdvancedFiltersProps {
  region: IMultiAutocompleteFieldOption[];
  species: IMultiAutocompleteFieldOption[];
  funding_sources: IMultiAutocompleteFieldOption[];
}

/**
 * Observation - Advanced filters
 *
 * @return {*}
 */
const ObservationAdvancedFilters: React.FC<IObservationAdvancedFiltersProps> = (props) => {
  const formikProps = useFormikContext<IObservationAdvancedFilters>();

  const { handleSubmit, handleChange, values } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required={false}
            id="keyword"
            name="keyword"
            label="Keyword (or any portion of any word)"
            variant="outlined"
            value={values.keyword}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required={false}
            id="project_name"
            name="project_name"
            label="Project Name"
            variant="outlined"
            value={values.project_name}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <MultiAutocompleteFieldVariableSize id="species" label="Species" options={props.species} required={false} />
        </Grid>
        <Grid item xs={12} md={6}>
          <MultiAutocompleteFieldVariableSize id="regions" label="Regions" options={props.region} required={false} />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl variant="outlined" required={false} style={{ width: '100%' }}>
            <InputLabel id="agency_id-label">Funding Agency Name</InputLabel>
            <Select
              id="agency_id"
              name="agency_id"
              labelId="agency_id-label"
              label="Funding Agency Name"
              value={values.agency_id}
              onChange={handleChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Funding Agency Name', 'data-testid': 'agency-id' }}>
              {props.funding_sources.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required={false}
            id="agency_project_id"
            name="agency_project_id"
            label="Funding Agency Project ID"
            variant="outlined"
            value={values.agency_project_id}
            onChange={handleChange}
          />
        </Grid>
        <StartEndDateFields formikProps={formikProps} startRequired={false} endRequired={false} />
      </Grid>
    </form>
  );
};

export default ObservationAdvancedFilters;
