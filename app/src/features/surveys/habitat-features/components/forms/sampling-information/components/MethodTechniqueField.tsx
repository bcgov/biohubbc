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
  SamplingInformationCachedTechnique
} from 'features/surveys/habitat-features/components/forms/sampling-information/hooks/useSamplingInformationCache';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useIsMounted from 'hooks/useIsMounted';
import { get } from 'lodash-es';
import debounce from 'lodash-es/debounce';
import { useEffect, useMemo, useState } from 'react';

export interface IMethodTechniqueFieldProps {
  samplingInformationCache: SamplingInformationCache;
}

/**
 * Method technique formik field.
 *
 * @param {IMethodTechniqueFieldProps} props
 * @return {*}
 */
export const MethodTechniqueField = (props: IMethodTechniqueFieldProps) => {
  const { samplingInformationCache } = props;

  const { values, errors, touched, setFieldValue } = useFormikContext<
    CreateHabitatFeatureFormValues | UpdateHabitatFeatureFormValues
  >();

  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();

  const isMounted = useIsMounted();

  // The currently selected option
  const [currentOption, setCurrentOption] = useState<SamplingInformationCachedTechnique | null>(
    values.method_technique_id ? samplingInformationCache.getCurrentTechnique(values.method_technique_id) : null
  );
  const [options, setOptions] = useState<SamplingInformationCachedTechnique[]>(
    samplingInformationCache.getTechniquesForRow(values.survey_sample_site_id ?? null)
  );
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

        const surveySampleSiteId = values.survey_sample_site_id;

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
        const validOptions = samplingInformationCache.getTechniquesForRow(values.survey_sample_site_id ?? null);

        // Set the options for the autocomplete
        setOptions(validOptions);

        setIsLoading(false);
      }, 500),
    [biohubApi.technique, values.survey_sample_site_id, isMounted, samplingInformationCache, surveyContext.surveyId]
  );

  useEffect(() => {
    if (!values.survey_sample_site_id) {
      // If the site not selected, then unset any selected technique, as its value is dependent
      // on the site.
      setCurrentOption(null);
      return;
    }

    if (currentOption?.survey_sample_site_id !== values.survey_sample_site_id) {
      // If the site has changed, then unset any selected technique, and update the options to reflect the
      // valid techniques for the new site.
      setCurrentOption(null);
      // Set the options to any previously cached techniques for the new site
      setOptions(samplingInformationCache.getTechniquesForRow(values.survey_sample_site_id));
      // Trigger a search to get all of the techniques for the new site
      setIsLoading(true);
      getOptions('');
    }
  }, [currentOption?.survey_sample_site_id, getOptions, samplingInformationCache, values.survey_sample_site_id]);

  return (
    <Autocomplete
      id="method_technique_id"
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
        setFieldValue('survey_sample_period_id', null);
        // Set the data grid cell value for the selected method technique option
        setFieldValue('method_technique_id', selectedOption?.value);

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
          variant="outlined"
          fullWidth
          placeholder="Search for a technique"
          error={get(touched, 'method_technique_id') && Boolean(get(errors, 'method_technique_id'))}
          helperText={get(touched, 'method_technique_id') && get(errors, 'method_technique_id')}
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
            key={renderOption.method_technique_id}>
            <Box py={1}>
              <Typography fontWeight={700}>{renderOption.label}</Typography>
            </Box>
          </Box>
        );
      }}
      data-testid={'method_technique-field'}
    />
  );
};
