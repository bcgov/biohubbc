import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import AsyncAutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AsyncAutocompleteDataGridEditCell';
import { IAutocompleteDataGridSampleSiteOption } from 'components/data-grid/sample-site/SampleSiteDataGrid.interface';
import { ISampleSiteOption } from 'features/surveys/observations/observations-table/grid-column-definitions/GridColumnDefinitions';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { IGetSampleLocationNonSpatialDetails } from 'interfaces/useSamplingSiteApi.interface';
import debounce from 'lodash-es/debounce';
import { useMemo } from 'react';

export interface ISampleSiteDataGridCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderEditCellParams<DataGridType>;
  onSelectSampleSite: (selectedSampleSite: IGetSampleLocationNonSpatialDetails) => void;
  initialSampleSite?: ISampleSiteOption;
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
const SampleSiteDataGridEditCell = <DataGridType extends GridValidRowModel>(
  props: ISampleSiteDataGridCellProps<DataGridType>
) => {
  const { dataGridProps, initialSampleSite } = props;

  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();

  const getCurrentOption = async (): Promise<{ label: string; value: number } | null> => {
    if (!initialSampleSite) {
      return null;
    }

    return { label: initialSampleSite.sample_site_name, value: initialSampleSite.survey_sample_site_id };
  };

  const getOptions = useMemo(
    () =>
      debounce(
        async (
          searchTerm: string,
          onSearchResults: (searchedValues: IAutocompleteDataGridSampleSiteOption[]) => void
        ) => {
          if (!searchTerm) {
            onSearchResults([]);
            return;
          }

          const keyword = searchTerm?.trim();

          const response = await biohubApi.samplingSite.getSampleSites(
            surveyContext.projectId,
            surveyContext.surveyId,
            { keyword }
          );

          const options = response.sampleSites.map((item) => ({
            ...item,
            label: item.name,
            value: item.survey_sample_site_id
          }));
          onSearchResults(options);
        },
        500
      ),
    [biohubApi.samplingSite, surveyContext.projectId, surveyContext.surveyId]
  );

  return (
    <AsyncAutocompleteDataGridEditCell
      dataGridProps={dataGridProps}
      getCurrentOption={getCurrentOption}
      getOptions={getOptions}
      error={props.error}
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
      onSelectOption={(selectedOption) => {
        console.log('selectedOption', selectedOption);
      }}
    />
  );
};

export default SampleSiteDataGridEditCell;
