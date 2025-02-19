import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import {
  SamplingInformationCache,
  SamplingInformationCachedPeriod
} from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/useSamplingInformationCache';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useIsMounted from 'hooks/useIsMounted';
import debounce from 'lodash-es/debounce';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getDateTimeLabel } from 'utils/datetime';

export interface ISamplePeriodDataGridEditCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderCellParams<DataGridType>;
  samplingInformationCache: SamplingInformationCache;
  error?: boolean;
}

/**
 * Data survey sample period component for edit.
 *
 * @template DataGridType
 * @param {ISamplePeriodDataGridEditCellProps<DataGridType>} props
 * @return {*}
 */
export const SamplePeriodDataGridEditCell = <DataGridType extends GridValidRowModel>(
  props: ISamplePeriodDataGridEditCellProps<DataGridType>
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
  const [currentOption, setCurrentOption] = useState<SamplingInformationCachedPeriod | null>(
    samplingInformationCache.getCurrentPeriod(dataGridProps.value)
  );
  // The options for the autocomplete
  const [options, setOptions] = useState<SamplingInformationCachedPeriod[]>(
    samplingInformationCache.getPeriodsForRow(
      dataGridProps.row.survey_sample_site_id,
      dataGridProps.row.method_technique_id
    )
  );
  // The survey sample site id and method technique id for the current set of options
  // These are used to detect if the site or technique value in the data grid state has changed, and therefore the
  // options of this control should be updated.
  const [currentSiteId, setCurrentSiteId] = useState<number | null>(dataGridProps.row.survey_sample_site_id);
  const [currentTechniqueId, setCurrentTechniqueId] = useState<number | null>(dataGridProps.row.method_technique_id);
  // Is control loading (search in progress)
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Debounced function to get the options for the autocomplete, based on the search term.
   * Includes the cached sample periods in the resulting options array.
   */
  const getOptions = useMemo(
    () =>
      debounce(async (_searchTerm: string) => {
        const surveySampleSiteId = dataGridProps.row.survey_sample_site_id;
        const methodTechniqueId = dataGridProps.row.method_technique_id;

        if (!surveySampleSiteId || !methodTechniqueId) {
          // Currently the control requires that a site and technique be selected first, before periods can be
          // searched/selected
          setIsLoading(false);
          return;
        }

        const response = await biohubApi.samplingPeriod.findSamplePeriods({
          survey_id: surveyContext.surveyId,
          sample_site_id: surveySampleSiteId,
          method_technique_id: methodTechniqueId
        });

        if (!isMounted()) {
          return;
        }

        const options = response.periods
          .map((item) => ({
            ...item,
            label: getDateTimeLabel(item.start_date, item.start_time, item.end_date, item.end_time),
            value: item.survey_sample_period_id
          }))
          // Filter out any periods that do not have a start and end date (and should not be selectable in the UI)
          .filter((item) => item.start_date && item.end_date);

        samplingInformationCache.updateCachedSamplingPeriods(options);

        const validOptions = samplingInformationCache.getPeriodsForRow(surveySampleSiteId, methodTechniqueId);

        // Track the survey sample site id and method technique id for the current set of options
        setCurrentSiteId(surveySampleSiteId);
        setCurrentTechniqueId(methodTechniqueId);
        // Set the options for the autocomplete
        setOptions(validOptions);

        setIsLoading(false);
      }, 500),
    [
      biohubApi.samplingPeriod,
      dataGridProps.row.survey_sample_site_id,
      dataGridProps.row.method_technique_id,
      isMounted,
      samplingInformationCache,
      surveyContext.surveyId
    ]
  );

  useEffect(() => {
    if (!dataGridProps.row.survey_sample_site_id || !dataGridProps.row.method_technique_id) {
      // If either the site or technique is not selected, then unset any selected period, as its value is dependent
      // on the site and technique.
      setCurrentOption(null);
      setOptions([]);
      return;
    }

    if (
      currentSiteId !== dataGridProps.row.survey_sample_site_id ||
      currentTechniqueId !== dataGridProps.row.method_technique_id
    ) {
      // If the site or technique has changed, then unset any selected period, and update the options to reflect the
      // valid periods for the new site and technique.
      setCurrentOption(null);
      // Set the options to any previously cached periods for the new site + technique
      setOptions(
        samplingInformationCache.getPeriodsForRow(
          dataGridProps.row.survey_sample_site_id,
          dataGridProps.row.method_technique_id
        )
      );
      // Trigger a search to get all of the periods for the new site + technique
      getOptions('');
    }
  }, [
    currentSiteId,
    currentTechniqueId,
    getOptions,
    dataGridProps.row.method_technique_id,
    dataGridProps.row.survey_sample_site_id,
    samplingInformationCache
  ]);

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

        // Set the data grid cell value for the selected sampling period option
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
          placeholder="Search for a period"
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
