import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import assert from 'assert';
import AutocompleteFreeSoloField from 'components/fields/AutocompleteFreeSoloField';
import CustomTextField from 'components/fields/CustomTextField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { CodesContext } from 'contexts/codesContext';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { debounce } from 'lodash-es';
import React, { useCallback, useContext } from 'react';

export interface IProjectAdvancedFilters {
  coordinator_agency: string;
  permit_number: string;
  project_programs: number[];
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
  project_programs: [],
  start_date: '',
  end_date: '',
  keyword: '',
  project_name: '',
  agency_id: '' as unknown as number,
  agency_project_id: '',
  species: []
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

  const biohubApi = useBiohubApi();

  const { handleSubmit } = formikProps;

  const codesContext = useContext(CodesContext);
  assert(codesContext.codesDataLoader.data);

  const convertOptions = (value: any): IMultiAutocompleteFieldOption[] =>
    value.map((item: any) => {
      return { value: parseInt(item.id), label: item.label };
    });

  const handleGetInitList = async (initialvalues: number[]) => {
    const response = await biohubApi.taxonomy.getSpeciesFromIds(initialvalues);
    return convertOptions(response.searchResponse);
  };

  const handleSearch = useCallback(
    debounce(
      async (
        inputValue: string,
        existingValues: (string | number)[],
        callback: (searchedValues: IMultiAutocompleteFieldOption[]) => void
      ) => {
        const response = await biohubApi.taxonomy.searchSpecies(inputValue.toLowerCase());
        const newOptions = convertOptions(response.searchResponse).filter(
          (item) => !existingValues?.includes(item.value)
        );
        callback(newOptions);
      },
      500
    ),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
            <MultiAutocompleteFieldVariableSize
              id={'project_programs'}
              label={'Project Programs'}
              options={
                codesContext.codesDataLoader.data.program.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
            {/* <Select
              id="project_programs"
              name="project_programs"
              labelId="project_programs"
              label="Project Programs"
              value={values.project_programs}
              onChange={handleChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Project Type' }}>
              <MenuItem key={1} value={1}>
                Fisheries
              </MenuItem>
              <MenuItem key={2} value={2}>
                Wildlife
              </MenuItem>
              <MenuItem key={3} value={3}>
                Aquatic Habitat
              </MenuItem>
              <MenuItem key={4} value={4}>
                Terrestrial Habitat
              </MenuItem>
            </Select> */}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <StartEndDateFields
            formikProps={formikProps}
            startName="start_date"
            endName="end_date"
            startRequired={false}
            endRequired={false}
          />
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
          <CustomTextField name="agency_project_id" label="Funding Agency Project ID" />
        </Grid>
        <Grid item xs={6}>
          <MultiAutocompleteFieldVariableSize
            id="species"
            label="Species"
            required={false}
            type="api-search"
            getInitList={handleGetInitList}
            search={handleSearch}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectAdvancedFilters;
