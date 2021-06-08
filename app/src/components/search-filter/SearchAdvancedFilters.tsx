import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import MapBoundary from 'components/boundary/MapBoundary';
import AutocompleteFreeSoloField from 'components/fields/AutocompleteFreeSoloField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useEffect, useState } from 'react';
import { updateMapBounds } from 'utils/mapBoundaryUploadHelpers';

export interface ISearchAdvancedFilters {
  keyword: string;
  project_name: string;
  start_date: string;
  end_date: string;
  regions: string[];
  agency_id: number;
  agency_project_id: string;
  species: number[];
  coordinator_agency: string;
  geometry: Feature[];
}

export const SearchAdvancedFiltersInitialValues: ISearchAdvancedFilters = {
  keyword: '',
  project_name: '',
  start_date: '',
  end_date: '',
  regions: [],
  agency_id: ('' as unknown) as number,
  agency_project_id: '',
  species: [],
  coordinator_agency: '',
  geometry: []
};

export interface ISearchAdvancedFiltersProps {
  region: IMultiAutocompleteFieldOption[];
  species: IMultiAutocompleteFieldOption[];
  funding_sources: IMultiAutocompleteFieldOption[];
  coordinator_agency: string[];
}

/**
 * General Search - Advanced filters
 *
 * @return {*}
 */
const SearchAdvancedFilters: React.FC<ISearchAdvancedFiltersProps> = (props) => {
  const formikProps = useFormikContext<ISearchAdvancedFilters>();

  const { handleSubmit, handleChange, values, setFieldValue } = formikProps;

  const [bounds, setBounds] = useState<any>([]);
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
    updateMapBounds(values.geometry, setBounds);
  }, [values.geometry]);

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
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
          <AutocompleteFreeSoloField
            id="coordinator_agency"
            name="coordinator_agency"
            label="Coordinator Agency"
            options={props.coordinator_agency}
            required={false}
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
        <MapBoundary
          title="Search Boundary"
          mapId="search_boundary_map"
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          uploadError={uploadError}
          setUploadError={setUploadError}
          values={values}
          bounds={bounds}
          setFieldValue={setFieldValue}
        />
      </Grid>
    </form>
  );
};

export default SearchAdvancedFilters;
