import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import AsyncAutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AsyncAutocompleteDataGridEditCell';
import { IAutocompleteDataGridOption } from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useTaxonomyContext } from 'hooks/useContext';
import debounce from 'lodash-es/debounce';
import { useMemo } from 'react';

export interface ITaxonomyDataGridCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderEditCellParams<DataGridType>;
  error?: boolean;
}

/**
 * Data grid taxonomy component for edit.
 *
 * @template DataGridType
 * @template ValueType
 * @param {ITaxonomyDataGridCellProps<DataGridType>} props
 * @return {*}
 */
const TaxonomyDataGridEditCell = <DataGridType extends GridValidRowModel, ValueType extends string | number>(
  props: ITaxonomyDataGridCellProps<DataGridType>
) => {
  const { dataGridProps } = props;

  const taxonomyContext = useTaxonomyContext();
  const biohubApi = useBiohubApi();

  const getCurrentOption = async (
    speciesId: string | number
  ): Promise<IAutocompleteDataGridOption<ValueType> | null> => {
    if (!speciesId) {
      return null;
    }

    const id = Number(speciesId);

    if (isNaN(id)) {
      return null;
    }

    const response = taxonomyContext.getCachedSpeciesTaxonomyById(id);

    if (!response) {
      return null;
    }

    return {
      value: Number(response.tsn) as ValueType,
      label: [response.commonNames[0], `(${response.scientificName})`].filter(Boolean).join(' ')
    };
  };

  const getOptions = useMemo(
    () =>
      debounce(
        async (
          searchTerm: string,
          onSearchResults: (searchedValues: IAutocompleteDataGridOption<ValueType>[]) => void
        ) => {
          if (!searchTerm) {
            onSearchResults([]);
            return;
          }

          const searchTermsSplit = searchTerm.split(' ').filter(Boolean);
          const response = await biohubApi.taxonomy.searchSpeciesByTerms(searchTermsSplit);
          const options = response.map((item) => ({
            value: item.tsn as ValueType,
            label: item.commonNames ? `${item.commonNames[0]} (${item.scientificName})` : item.scientificName
          }));
          onSearchResults(options);
        },
        500
      ),
    [biohubApi.taxonomy]
  );

  return (
    <AsyncAutocompleteDataGridEditCell
      dataGridProps={dataGridProps}
      getCurrentOption={getCurrentOption}
      getOptions={getOptions}
      error={props.error}
    />
  );
};

export default TaxonomyDataGridEditCell;
