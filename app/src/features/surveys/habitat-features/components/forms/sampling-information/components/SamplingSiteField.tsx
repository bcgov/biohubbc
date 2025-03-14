import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  CreateHabitatFeatureFormValues,
  UpdateHabitatFeatureFormValues
} from 'features/surveys/habitat-features/components/forms/HabitatFeatureFormContainer';
import {
  SamplingInformationCache,
  SamplingInformationCachedSite
} from 'features/surveys/habitat-features/components/forms/sampling-information/hooks/useSamplingInformationCache';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useIsMounted from 'hooks/useIsMounted';
import { get } from 'lodash-es';
import debounce from 'lodash-es/debounce';
import { useEffect, useMemo, useState } from 'react';

export interface ISamplingSiteFieldProps {
  samplingInformationCache: SamplingInformationCache;
}

/**
 * Survey sample site formik field.
 *
 * @param {ISamplingSiteFieldProps<DataGridType>} props
 * @return {*}
 */
export const SamplingSiteField = (props: ISamplingSiteFieldProps) => {
  const { samplingInformationCache } = props;

  const { values, errors, touched, setFieldValue } = useFormikContext<
    CreateHabitatFeatureFormValues | UpdateHabitatFeatureFormValues
  >();

  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();

  const isMounted = useIsMounted();

  // The currently selected option
  const [currentOption, setCurrentOption] = useState<SamplingInformationCachedSite | null>(
    values.survey_sample_site_id ? samplingInformationCache.getCurrentSite(values.survey_sample_site_id) : null
  );
  const [options, setOptions] = useState<SamplingInformationCachedSite[]>(
    Array.from(samplingInformationCache.cachedSamplingInformationRef.current?.sites.values() ?? [])
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
        setOptions(Array.from(samplingInformationCache.cachedSamplingInformationRef.current?.sites.values() ?? []));

        setIsLoading(false);
      }, 500),
    [biohubApi.samplingSite, isMounted, samplingInformationCache, surveyContext.surveyId]
  );

  useEffect(() => {
    if (options.length || isLoading) {
      return;
    }

    // Preload the options on initial load
    setIsLoading(true);
    getOptions('');
  }, [getOptions, isLoading, options.length]);

  return (
    <Autocomplete
      id="survey_sample_site_id"
      noOptionsText={isLoading ? 'Loading...' : 'No matching options'}
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
        setFieldValue('method_technique_id', null);
        setFieldValue('survey_sample_period_id', null);

        // Set the data grid cell value for the selected sampling site option
        setFieldValue('survey_sample_site_id', selectedOption?.value);

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
          variant="outlined"
          fullWidth
          label={'Sample Site'}
          placeholder="Search for a site"
          error={get(touched, 'survey_sample_site_id') && Boolean(get(errors, 'survey_sample_site_id'))}
          helperText={get(touched, 'survey_sample_site_id') && get(errors, 'survey_sample_site_id')}
          InputProps={{
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
            {...renderProps}
            sx={{
              '& + li': {
                borderTop: '1px solid' + grey[300]
              }
            }}
            key={renderOption.survey_sample_site_id}>
            <Box py={1}>
              <Typography fontWeight={700}>{renderOption.label}</Typography>
            </Box>
          </Box>
        );
      }}
      data-testid={'survey_sample_site-field'}
    />
  );
};
