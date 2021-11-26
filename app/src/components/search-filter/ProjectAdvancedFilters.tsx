import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import AutocompleteFreeSoloField from 'components/fields/AutocompleteFreeSoloField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import CustomTextField from 'components/fields/CustomTextField';
export interface IProjectAdvancedFilters {
  coordinator_agency: string;
  permit_number: string;
  project_type: string;
  start_date: string;
  end_date: string;
  keyword: string;
  project_name: string;
  agency_id: number;
  agency_project_id: string;
  species: number[];
}

export const ProjectAdvancedFiltersInitialValues: IProjectAdvancedFilters = {
  coordinator_agency: '',
  permit_number: '',
  project_type: '',
  start_date: '',
  end_date: '',
  keyword: '',
  project_name: '',
  agency_id: ('' as unknown) as number,
  agency_project_id: '',
  species: []
};

export interface IProjectAdvancedFiltersProps {
  species: IMultiAutocompleteFieldOption[];
  funding_sources: IMultiAutocompleteFieldOption[];
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
        <Grid item xs={12}>
          <CustomTextField name="keyword" label="Keyword (or any portion of any word)" />
        </Grid>
        <Grid item xs={12} md={3}>
          <CustomTextField name="project_name" label="Project Name" />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined" required={false}>
            <InputLabel id="project_type">Project Type</InputLabel>
            <Select
              id="project_type"
              name="project_type"
              labelId="project_type"
              label="Project Type"
              value={values.project_type}
              onChange={handleChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Project Type' }}>
              <MenuItem key={1} value="Fisheries">
                Fisheries
              </MenuItem>
              <MenuItem key={2} value="Wildlife">
                Wildlife
              </MenuItem>
              <MenuItem key={3} value="Aquatic Habitat">
                Aquatic Habitat
              </MenuItem>
              <MenuItem key={4} value="Terrestrial Habitat">
                Terrestrial Habitat
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <StartEndDateFields formikProps={formikProps} startRequired={false} endRequired={false} />
        </Grid>
        <Grid item xs={12} md={3}>
          <AutocompleteFreeSoloField
            id="coordinator_agency"
            name="coordinator_agency"
            label="Contact Agency"
            options={props.coordinator_agency}
            required={false}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <CustomTextField name="permit_number" label="Permit Number" />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined" required={false}>
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
        <Grid item xs={12} md={3}>
          <CustomTextField name="agency_project_id" label="Funding Agency Project ID" />
        </Grid>
        <Grid item xs={6}>
          <MultiAutocompleteFieldVariableSize id="species" label="Species" options={props.species} required={false} />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectAdvancedFilters;
