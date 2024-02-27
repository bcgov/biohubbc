import { Box } from '@mui/system';
import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import AsyncAutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AsyncAutocompleteDataGridEditCell';
import { IAutocompleteDataGridOption } from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';
import SpeciesCard from 'components/species/components/SpeciesCard';
import { TaxonomyContext } from 'contexts/taxonomyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import debounce from 'lodash-es/debounce';
import { useContext, useMemo } from 'react';

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

  const taxonomyContext = useContext(TaxonomyContext);
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
      label: [response.commonName, `(${response.scientificName})`].filter(Boolean).join(' ')
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

          const response = await biohubApi.taxonomy.searchSpeciesByTerms([searchTerm]);
          const options = response.map((item) => ({
            value: item.tsn as ValueType,
            label: [item.commonName, `(${item.scientificName})`].filter(Boolean).join(' '),
            subtext: item.scientificName
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
      renderOption={(renderProps, renderOption) => {
        return (
          <Box component="li" {...renderProps} key={renderOption.value}>
            <SpeciesCard name={renderOption.label} subtext={String(renderOption.subtext)} />
          </Box>
        );
      }}
    />
  );
};

export default TaxonomyDataGridEditCell;
