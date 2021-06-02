import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import AutocompleteFreeSoloField from 'components/fields/AutocompleteFreeSoloField';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';

export interface IProjectAdvancedFilters {
  coordinator_agency: string;
  permit_number: string;
  permit_type: string;
  start_date: string;
  end_date: string;
}

export const ProjectAdvancedFiltersInitialValues: IProjectAdvancedFilters = {
  coordinator_agency: '',
  permit_number: '',
  permit_type: '',
  start_date: '',
  end_date: ''
};

export interface IProjectAdvancedFiltersProps {
  coordinator_agency: string[];
}

/**
 * Project - Advanced filters
 *
 * @return {*}
 */
const ProjectAdvancedFilters: React.FC<IProjectAdvancedFiltersProps> = (props) => {
  const formikProps = useFormikContext<IProjectAdvancedFilters>();

  const { handleSubmit, handleChange, values } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <StartEndDateFields formikProps={formikProps} startRequired={false} endRequired={false} />
        <Grid item xs={12} md={4}>
          <AutocompleteFreeSoloField
            id="coordinator_agency"
            name="coordinator_agency"
            label="Coordinator Agency"
            options={props.coordinator_agency}
            required={false}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="permit_number"
            name="permit_number"
            label="Permit Number"
            variant="outlined"
            onChange={handleChange}
            value={values.permit_number}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl variant="outlined" required={false} style={{ width: '100%' }}>
            <InputLabel id="permit_type">Permit Type</InputLabel>
            <Select
              id="permit_type"
              name="permit_type"
              labelId="permit_type"
              label="Permit Type"
              value={values.permit_type}
              onChange={handleChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Permit Type' }}>
              <MenuItem key={1} value="Park Use Permit">
                Park Use Permit
              </MenuItem>
              <MenuItem key={2} value="Wildlife Permit - General">
                Wildlife Permit - General
              </MenuItem>
              <MenuItem key={3} value="Scientific Fish Collection Permit">
                Scientific Fish Collection Permit
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectAdvancedFilters;
