import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import AsyncAutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AsyncAutocompleteDataGridEditCell';
import {
  SamplingInformationCache,
  SamplingInformationCachedSite
} from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/useSamplingInformationCache';
import { getCurrentSite } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/utils';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useIsMounted from 'hooks/useIsMounted';
import debounce from 'lodash-es/debounce';
import { useMemo } from 'react';

export interface ISampleSiteDataGridCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderEditCellParams<DataGridType>;
  samplingInformationCache: SamplingInformationCache;
  onSelectOption?: (selectedSampleSite: SamplingInformationCachedSite | null) => void;
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
  const { dataGridProps, samplingInformationCache, onSelectOption, error } = props;

  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();

  const isMounted = useIsMounted();

  /**
   * Get the current option for the autocomplete, if the field has a value.
   *
   * @return {*}  {(Promise<SamplingInformationCachedSite | null>)}
   */
  const getCurrentOption = async (): Promise<SamplingInformationCachedSite | null> => {
    return getCurrentSite(dataGridProps, samplingInformationCache.cachedSampleLocationsRef);
  };

  /**
   * Merge the cached sample locations with the new options returned by the async search, removing duplicates.
   *
   * @param {SamplingInformationCachedSite[]} cachedOptions
   * @param {SamplingInformationCachedSite[]} options
   * @return {*}
   */
  const mergeOptions = (cachedOptions: SamplingInformationCachedSite[], options: SamplingInformationCachedSite[]) => {
    const mergedOptionsMap = new Map<number, SamplingInformationCachedSite>();

    // Merge the cached options with the new options, ensuring no duplicates
    [...options, ...cachedOptions].forEach((item) => {
      mergedOptionsMap.set(item.value, {
        ...item,
        label: item.label,
        value: item.value
      });
    });

    return Array.from(mergedOptionsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  };

  /**
   * Debounced function to get the options for the autocomplete, based on the search term.
   * Includes the cached sample locations in the resulting options array.
   */
  const getOptions = useMemo(
    () =>
      debounce(
        async (
          searchTerm: string,
          onSearchResults: (searchedValues: SamplingInformationCachedSite[]) => void,
          onComplete: () => void
        ) => {
          const keyword = searchTerm?.trim();

          return biohubApi.samplingSite
            .findSampleSites({ survey_id: surveyContext.surveyId, keyword })
            .then((response) => {
              if (!isMounted()) {
                return;
              }

              const options = response.sites.map((item) => ({
                ...item,
                label: item.name,
                value: item.survey_sample_site_id
              }));

              const cachedOptions = samplingInformationCache.cachedSampleLocationsRef.current?.sites ?? [];

              const mergedOptions = mergeOptions(cachedOptions, options);

              onSearchResults(mergedOptions);
              onComplete();
            });
        },
        500
      ),
    [biohubApi.samplingSite, isMounted, samplingInformationCache.cachedSampleLocationsRef, surveyContext.surveyId]
  );

  /**
   * Get the initial options for the autocomplete.
   *
   * @return {*}
   */
  const getInitialOptions = () => {
    return samplingInformationCache.cachedSampleLocationsRef.current?.sites ?? [];
  };

  return (
    <AsyncAutocompleteDataGridEditCell
      dataGridProps={dataGridProps}
      getCurrentOption={getCurrentOption}
      getInitialOptions={getInitialOptions}
      getOptions={getOptions}
      onSelectOption={(selectedOption) => {
        // If the sample site is changed, clear the sample method and period as they are dependent on the site
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

        onSelectOption?.(selectedOption);
      }}
      placeholder="Search for a site"
      error={error}
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
    />
  );
};
