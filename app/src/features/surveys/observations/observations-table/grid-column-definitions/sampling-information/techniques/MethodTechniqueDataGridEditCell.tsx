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
  SamplingInformationCachedTechnique
} from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/useSamplingInformationCache';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useIsMounted from 'hooks/useIsMounted';
import debounce from 'lodash-es/debounce';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface IMethodTechniqueDataGridCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderEditCellParams<DataGridType>;
  samplingInformationCache: SamplingInformationCache;
  error?: boolean;
}

/**
 * Data grid method technique component for edit.
 *
 * @template DataGridType
 * @template ValueType
 * @param {IMethodTechniqueDataGridCellProps<DataGridType>} props
 * @return {*}
 */
export const MethodTechniqueDataGridEditCell = <DataGridType extends GridValidRowModel>(
  props: IMethodTechniqueDataGridCellProps<DataGridType>
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
  const [currentOption, setCurrentOption] = useState<SamplingInformationCachedTechnique | null>(
    samplingInformationCache.getCurrentTechnique(dataGridProps.value)
  );
  // The options for the autocomplete
  const [options, setOptions] = useState<SamplingInformationCachedTechnique[]>(
    samplingInformationCache.getTechniquesForRow(dataGridProps.row.survey_sample_site_id)
  );
  // The survey sample site id for the current set of options
  // These are used to detect if the site value in the data grid state has changed, and therefore the options of this
  // control should be updated.
  const [currentSiteId, setCurrentSiteId] = useState<number | null>(dataGridProps.row.survey_sample_site_id);
  // Is control loading (search in progress)
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Debounced function to get the options for the autocomplete, based on the search term.
   * Includes the cached method techniques in the resulting options array.
   */
  const getOptions = useMemo(
    () =>
      debounce(async (searchTerm: string) => {
        const keyword = searchTerm?.trim();

        const surveySampleSiteId = dataGridProps.row.survey_sample_site_id;

        if (!surveySampleSiteId) {
          // Currently the control requires that a site be selected first, before techniques can be searched/selected
          setIsLoading(false);
          return;
        }

        const response = await biohubApi.technique.findTechniques({
          survey_id: surveyContext.surveyId,
          sample_site_id: surveySampleSiteId,
          keyword
        });

        if (!isMounted()) {
          return;
        }

        const options: SamplingInformationCachedTechnique[] = response.techniques.map((item) => ({
          method_technique_id: item.method_technique_id,
          survey_sample_site_id: surveySampleSiteId,
          method_response_metric_id: item.method_response_metric_id,
          label: item.name,
          value: item.method_technique_id
        }));

        // Update the cached method techniques
        samplingInformationCache.updateCachedMethodTechniques(options);

        // Get the latest valid options for the current row
        const validOptions = samplingInformationCache.getTechniquesForRow(dataGridProps.row.survey_sample_site_id);

        // Track the survey sample site id for the current set of options
        setCurrentSiteId(surveySampleSiteId);
        // Set the options for the autocomplete
        setOptions(validOptions);

        setIsLoading(false);
      }, 500),
    [
      biohubApi.technique,
      dataGridProps.row.survey_sample_site_id,
      isMounted,
      samplingInformationCache,
      surveyContext.surveyId
    ]
  );

  useEffect(() => {
    if (!dataGridProps.row.survey_sample_site_id) {
      // If the site not selected, then unset any selected technique, as its value is dependent
      // on the site.
      setCurrentOption(null);
      setOptions([]);
      return;
    }

    if (currentSiteId !== dataGridProps.row.survey_sample_site_id) {
      // If the site has changed, then unset any selected technique, and update the options to reflect the
      // valid techniques for the new site.
      setCurrentOption(null);
      // Set the options to any previously cached techniques for the new site
      setOptions(samplingInformationCache.getTechniquesForRow(dataGridProps.row.survey_sample_site_id));
      // Trigger a search to get all of the techniques for the new site
      getOptions('');
    }
  }, [currentSiteId, getOptions, dataGridProps.row.survey_sample_site_id, samplingInformationCache]);

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

        // If the method technique is changed, clear sampling period as it is dependent on the method technique
        dataGridProps.api.setEditCellValue({
          id: dataGridProps.id,
          field: 'survey_sample_period_id',
          value: null
        });

        // Set the data grid cell value for the selected method technique option
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
          setIsLoading(true);
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
          placeholder="Search for a technique"
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
