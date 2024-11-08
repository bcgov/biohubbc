import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import AsyncAutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AsyncAutocompleteDataGridEditCell';
import { IAutocompleteDataGridSampleSiteOption } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/sites/SampleSiteDataGrid.interface';
import { getCurrentSite } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/utils';
import { SampleLocationCache } from 'features/surveys/observations/observations-table/ObservationsTableContainer';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useIsMounted from 'hooks/useIsMounted';
import { IGetSampleLocationNonSpatialDetails } from 'interfaces/useSamplingSiteApi.interface';
import debounce from 'lodash-es/debounce';
import { MutableRefObject, useMemo } from 'react';

export interface ISampleSiteDataGridCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderEditCellParams<DataGridType>;
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>;
  onSelectOption?: (selectedSampleSite: IGetSampleLocationNonSpatialDetails | null) => void;
  error?: boolean;
}

/**
 * Data grid taxonomy component for edit.
 *
 * @template DataGridType
 * @template ValueType
 * @param {ISampleSiteDataGridCellProps<DataGridType>} props
 * @return {*}
 */
export const SampleSiteDataGridEditCell = <DataGridType extends GridValidRowModel>(
  props: ISampleSiteDataGridCellProps<DataGridType>
) => {
  const { dataGridProps, cachedSampleLocationsRef, onSelectOption, error } = props;

  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();

  const isMounted = useIsMounted();

  /**
   * Get the current option for the autocomplete, if the field has a value.
   *
   * @return {*}  {(Promise<IAutocompleteDataGridSampleSiteOption | null>)}
   */
  const getCurrentOption = async (): Promise<IAutocompleteDataGridSampleSiteOption | null> => {
    const currentSite = getCurrentSite(dataGridProps, cachedSampleLocationsRef);

    if (!currentSite) {
      return null;
    }

    return {
      ...currentSite,
      label: currentSite.name,
      value: currentSite.survey_sample_site_id
    };
  };

  /**
   * Merge the cached sample locations with the new options returned by the async search, removing duplicates.
   *
   * @param {IGetSampleLocationNonSpatialDetails[]} cachedOptions
   * @param {IGetSampleLocationNonSpatialDetails[]} options
   * @return {*}
   */
  const mergeOptions = (
    cachedOptions: IGetSampleLocationNonSpatialDetails[],
    options: IGetSampleLocationNonSpatialDetails[]
  ) => {
    const mergedOptionsMap = new Map<number, IAutocompleteDataGridSampleSiteOption>();

    // Merge the cached options with the new options, ensuring no duplicates
    [...cachedOptions, ...options].forEach((item) => {
      mergedOptionsMap.set(item.survey_sample_site_id, {
        ...item,
        label: item.name,
        value: item.survey_sample_site_id
      });
    });

    return Array.from(mergedOptionsMap.values());
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
          onSearchResults: (searchedValues: IAutocompleteDataGridSampleSiteOption[]) => void
        ) => {
          const keyword = searchTerm?.trim();

          biohubApi.samplingSite
            .getSampleSites(surveyContext.projectId, surveyContext.surveyId, { keyword })
            .then((response) => {
              const options = response.sampleSites.map((item) => ({
                ...item,
                label: item.name,
                value: item.survey_sample_site_id
              }));

              if (!isMounted()) {
                return;
              }

              const mergedOptions = mergeOptions(cachedSampleLocationsRef.current?.locations ?? [], options);

              onSearchResults(mergedOptions);
            });

          onSearchResults(
            cachedSampleLocationsRef.current?.locations.map((item) => ({
              ...item,
              label: item.name,
              value: item.survey_sample_site_id
            })) ?? []
          );
        },
        500
      ),
    [biohubApi.samplingSite, cachedSampleLocationsRef, isMounted, surveyContext.projectId, surveyContext.surveyId]
  );

  /**
   * Get the initial options for the autocomplete.
   *
   * @return {*}
   */
  const getInitialOptions = () => {
    return (
      cachedSampleLocationsRef.current?.locations.map((item) => ({
        ...item,
        label: item.name,
        value: item.survey_sample_site_id
      })) ?? []
    );
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
          field: 'survey_sample_method_id',
          value: null
        });
        dataGridProps.api.setEditCellValue({
          id: dataGridProps.id,
          field: 'survey_sample_period_id',
          value: null
        });

        onSelectOption?.(selectedOption);
      }}
      error={error}
      renderOption={(renderProps, renderOption) => (
        <Box
          component="li"
          sx={{
            '& + li': {
              borderTop: '1px solid' + grey[300]
            }
          }}
          {...renderProps}
          key={`${renderOption.value}-${renderOption.label}`}>
          <Box py={1} width="100%">
            {renderOption.label}
          </Box>
        </Box>
      )}
    />
  );
};
