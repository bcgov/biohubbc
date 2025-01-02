import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import AsyncAutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AsyncAutocompleteDataGridEditCell';
import {
  SamplingInformationCache,
  SamplingInformationCachedTechnique
} from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/useSamplingInformationCache';
import {
  getCurrentTechnique,
  getTechniquesForRow
} from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/utils';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useIsMounted from 'hooks/useIsMounted';
import debounce from 'lodash-es/debounce';
import { useMemo, useRef } from 'react';

export interface IMethodTechniqueDataGridCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderEditCellParams<DataGridType>;
  samplingInformationCache: SamplingInformationCache;
  onSelectOption?: (selectedMethodTechnique: SamplingInformationCachedTechnique | null) => void;
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
  const { dataGridProps, samplingInformationCache, onSelectOption, error } = props;

  const ref = useRef<HTMLInputElement>();

  useEnhancedEffect(() => {
    if (dataGridProps.hasFocus) {
      ref.current?.focus();
    }
  }, [dataGridProps.hasFocus]);

  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();

  const isMounted = useIsMounted();

  /**
   * Get the current option for the autocomplete, if the field has a value.
   *
   * @return {*}  {(Promise<SamplingInformationCachedTechnique | null>)}
   */
  const getCurrentOption = async (): Promise<SamplingInformationCachedTechnique | null> => {
    return getCurrentTechnique(dataGridProps, samplingInformationCache.cachedSampleLocationsRef);
  };

  //   /**
  //    * Merge the cached sample locations with the new options returned by the async search, removing duplicates.
  //    *
  //    * @param {SamplingInformationCachedTechnique[]} cachedOptions
  //    * @param {SamplingInformationCachedTechnique[]} options
  //    * @return {*}
  //    */
  //   const mergeOptions = (
  //     cachedOptions: SamplingInformationCachedTechnique[],
  //     options: SamplingInformationCachedTechnique[]
  //   ) => {
  //     const mergedOptionsMap = new Map<number, SamplingInformationCachedTechnique>();

  //     // Merge the cached options with the new options, ensuring no duplicates
  //     [...options, ...cachedOptions].forEach((item) => {
  //       mergedOptionsMap.set(item.value, {
  //         ...item,
  //         label: item.label,
  //         value: item.value
  //       });
  //     });

  //     return Array.from(mergedOptionsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  //   };

  /**
   * Debounced function to get the options for the autocomplete, based on the search term.
   * Includes the cached sample locations in the resulting options array.
   */
  const getOptions = useMemo(
    () =>
      debounce(
        async (
          searchTerm: string,
          onSearchResults: (searchedValues: SamplingInformationCachedTechnique[]) => void,
          onComplete: () => void
        ) => {
          const keyword = searchTerm?.trim();

          const surveySampleSiteId = dataGridProps.row.survey_sample_site_id;

          if (!surveySampleSiteId) {
            // Currently the control requires that a site be selected first, before techniques can be searched/selected
            onComplete();
            return;
          }

          return biohubApi.technique
            .findTechniques({ survey_id: surveyContext.surveyId, sample_site_id: surveySampleSiteId, keyword })
            .then((response) => {
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

              samplingInformationCache.updateCachedMethodTechniques(options);

              const validOptions = getTechniquesForRow(
                dataGridProps.row.survey_sample_site_id,
                samplingInformationCache.cachedSampleLocationsRef
              );

              onSearchResults(validOptions);
              onComplete();
            });
        },
        500
      ),
    [
      biohubApi.technique,
      dataGridProps.row.survey_sample_site_id,
      isMounted,
      samplingInformationCache,
      surveyContext.surveyId
    ]
  );

  /**
   * Get the initial options for the autocomplete.
   *
   * @return {*}
   */
  const getInitialOptions = () => {
    if (!dataGridProps.row.survey_sample_site_id) {
      return [];
    }

    return getTechniquesForRow(
      dataGridProps.row.survey_sample_site_id,
      samplingInformationCache.cachedSampleLocationsRef
    );
  };

  return (
    <AsyncAutocompleteDataGridEditCell
      dataGridProps={dataGridProps}
      getCurrentOption={getCurrentOption}
      getInitialOptions={getInitialOptions}
      getOptions={getOptions}
      onSelectOption={(selectedOption) => {
        // If the method technique is changed, clear sample period as is is dependent on the technique
        dataGridProps.api.setEditCellValue({
          id: dataGridProps.id,
          field: 'survey_sample_period_id',
          value: null
        });

        onSelectOption?.(selectedOption);
      }}
      placeholder="Search for a technique"
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
