import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import {
  SamplingInformationCache,
  SamplingInformationCachedSite
} from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/useSamplingInformationCache';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useIsMounted from 'hooks/useIsMounted';
import debounce from 'lodash-es/debounce';
import { useMemo, useRef, useState } from 'react';

export interface ISampleSiteDataGridCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderEditCellParams<DataGridType>;
  samplingInformationCache: SamplingInformationCache;
  error?: boolean;
}

/**
 * Data survey sample site component for edit.
 *
 * @template DataGridType
 * @template ValueType
 * @param {ISampleSiteDataGridCellProps<DataGridType>} props
 * @return {*}
 */
export const SampleSiteDataGridEditCell = <DataGridType extends GridValidRowModel>(
  props: ISampleSiteDataGridCellProps<DataGridType>
) => {
  const { dataGridProps, samplingInformationCache, error } = props;

  const ref = useRef<HTMLInputElement>();

  useEnhancedEffect(() => {
    if (dataGridProps.hasFocus) {
      ref.current?.focus();
    }
  }, [dataGridProps.hasFocus]);

  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();

  const isMounted = useIsMounted();

  // The currently selected option
  const [currentOption, setCurrentOption] = useState<SamplingInformationCachedSite | null>(
    samplingInformationCache.getCurrentSite(dataGridProps)
  );
  const [options, setOptions] = useState<SamplingInformationCachedSite[]>(
    samplingInformationCache.cachedSamplingInformationRef.current?.sites ?? []
  );
  // Is control loading (search in progress)
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Debounced function to get the options for the autocomplete, based on the search term.
   * Includes the cached sample sites in the resulting options array.
   */
  const getOptions = useMemo(
    () =>
      debounce(async (searchTerm: string) => {
        const keyword = searchTerm?.trim();

        const response = await biohubApi.samplingSite.findSampleSites({ survey_id: surveyContext.surveyId, keyword });

        if (!isMounted()) {
          return;
        }

        const options = response.sites.map((item) => ({
          ...item,
          label: item.name,
          value: item.survey_sample_site_id
        }));

        // Update the cached sampling sites
        samplingInformationCache.updateCachedSamplingSites(options);

        // Set the options for the autocomplete
        setOptions(samplingInformationCache.cachedSamplingInformationRef.current?.sites ?? []);

        setIsLoading(false);
      }, 500),
    [biohubApi.samplingSite, isMounted, samplingInformationCache, surveyContext.surveyId]
  );

  return (
    <Autocomplete
      id={`${dataGridProps.id}[${dataGridProps.field}]`}
      noOptionsText="No matching options"
      autoHighlight
      fullWidth
      blurOnSelect
      handleHomeEndKeys
      loading={isLoading}
      value={currentOption}
      options={options}
      PaperComponent={({ children }) => <Paper sx={{ minWidth: '600px' }}>{children}</Paper>}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => {
        if (!option?.value || !value?.value) {
          return false;
        }
        return option.value === value.value;
      }}
      filterOptions={(item) => item}
      onChange={(_, selectedOption) => {
        // Set the autocomplete value to the selected option
        setCurrentOption(selectedOption);

        // If the sampling site is changed, clear the method technique and sampling period as they are dependent on
        // the site
        dataGridProps.api.setEditCellValue({
          id: dataGridProps.id,
          field: 'method_technique_id',
          value: null
        });
        dataGridProps.api.setEditCellValue({
          id: dataGridProps.id,
          field: 'survey_sample_period_id',
          value: null
        });

        // Set the data grid cell value for the selected sampling site option
        dataGridProps.api.setEditCellValue({
          id: dataGridProps.id,
          field: dataGridProps.field,
          value: selectedOption?.value
        });

        setIsLoading(false);
      }}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === 'input' && newInputValue !== '') {
          // The user has updated the input field, and it is not empty, trigger the search.
          // The other options ('clear', 'reset') should not trigger a search.
          getOptions(newInputValue);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={ref}
          size="small"
          variant="outlined"
          fullWidth
          error={error}
          placeholder="Search for a site"
          InputProps={{
            color: error ? 'error' : undefined,
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(renderProps, renderOption) => {
        return (
          <Box
            component="li"
            sx={{
              '& + li': {
                borderTop: '1px solid' + grey[300]
              }
            }}
            {...renderProps}
            key={renderProps.id}>
            <Box py={1} width="100%">
              {renderOption.label}
            </Box>
          </Box>
        );
      }}
      data-testid={dataGridProps.id}
    />
  );
};
