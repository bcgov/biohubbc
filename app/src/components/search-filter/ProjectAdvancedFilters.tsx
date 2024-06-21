import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext } from 'hooks/useContext';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { debounce } from 'lodash-es';
import { useMemo } from 'react';

export interface IProjectAdvancedFilters {
  keyword: string;
  project_name: string;
  agency_id: number;
  agency_project_id: string;
  itis_tsns: number[];
}

export const ProjectAdvancedFiltersInitialValues: IProjectAdvancedFilters = {
  keyword: '',
  project_name: '',
  agency_id: '' as unknown as number,
  agency_project_id: '',
  itis_tsns: []
};

/**
 * Project - Advanced filters
 *
 * @return {*}
 */
const ProjectAdvancedFilters = () => {
  const formikProps = useFormikContext<IProjectAdvancedFilters>();

  const biohubApi = useBiohubApi();

  const { handleSubmit } = formikProps;

  const codesContext = useCodesContext();

  const convertOptions = (value: ITaxonomy[]): IMultiAutocompleteFieldOption[] =>
    value.map((item: any) => {
      return {
        value: parseInt(item.tsn),
        label: [...item.commonNames, `(${item.scientificName})`].filter(Boolean).join(' ')
      };
    });

  const handleGetInitList = async (initialvalues: number[]) => {
    if (!initialvalues.length) {
      return [];
    }

    const response = await biohubApi.taxonomy.getSpeciesFromIds(initialvalues);
    return convertOptions(response);
  };

  const handleSearch = useMemo(
    () =>
      debounce(
        async (
          inputValue: string,
          existingValues: (string | number)[],
          callback: (searchedValues: IMultiAutocompleteFieldOption[]) => void
        ) => {
          const searchTerms = inputValue.split(' ').filter(Boolean);
          const response = await biohubApi.taxonomy.searchSpeciesByTerms(searchTerms);
          const newOptions = convertOptions(response).filter((item) => !existingValues?.includes(item.value));
          callback(newOptions);
        },
        500
      ),
    [biohubApi.taxonomy]
  );

  if (!codesContext.codesDataLoader.data) {
    return <></>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextField name="keyword" label="Keyword (or any portion of any word)" />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomTextField name="project_name" label="Project Name" />
        </Grid>
        <Grid item xs={12} md={4}>
          <MultiAutocompleteFieldVariableSize
            id="itis_tsns"
            label="Species"
            required={false}
            type="api-search"
            getInitList={handleGetInitList}
            search={handleSearch}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="outlined" required={false}>
            <MultiAutocompleteFieldVariableSize
              id={'project_programs'}
              label={'Project Programs'}
              options={
                codesContext.codesDataLoader.data?.program?.map((item) => {
                  return { value: item.id, label: item.name };
                }) ?? []
              }
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={8}>
          <StartEndDateFields
            formikProps={formikProps}
            startName="start_date"
            endName="end_date"
            startRequired={false}
            endRequired={false}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectAdvancedFilters;
