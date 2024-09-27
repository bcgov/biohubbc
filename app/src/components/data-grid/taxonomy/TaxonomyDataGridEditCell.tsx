import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import AsyncAutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AsyncAutocompleteDataGridEditCell';
import { IAutocompleteDataGridTaxonomyOption } from 'components/data-grid/taxonomy/TaxonomyDataGrid.interface';
import SpeciesCard from 'components/species/components/SpeciesCard';
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
const TaxonomyDataGridEditCell = <DataGridType extends GridValidRowModel>(
  props: ITaxonomyDataGridCellProps<DataGridType>
) => {
  const { dataGridProps } = props;

  const taxonomyContext = useTaxonomyContext();
  const biohubApi = useBiohubApi();

  const getCurrentOption = async (speciesId: string | number): Promise<IAutocompleteDataGridTaxonomyOption | null> => {
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
      value: response.tsn,
      label: response.scientificName,
      commonNames: response.commonNames,
      tsn: response.tsn,
      scientificName: response.scientificName,
      rank: response.rank,
      kingdom: response.kingdom
    };
  };

  const getOptions = useMemo(
    () =>
      debounce(
        async (
          searchTerm: string,
          onSearchResults: (searchedValues: IAutocompleteDataGridTaxonomyOption[]) => void
        ) => {
          if (!searchTerm) {
            onSearchResults([]);
            return;
          }

          const searchTermsSplit = searchTerm.split(' ').filter(Boolean);
          const response = await biohubApi.taxonomy.searchSpeciesByTerms(searchTermsSplit);
          const options = response.map((item) => ({
            value: item.tsn,
            label: item.scientificName,
            tsn: item.tsn,
            commonNames: item.commonNames,
            scientificName: item.scientificName,
            rank: item.rank,
            kingdom: item.kingdom
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
      renderOption={(renderProps, renderOption) => (
        <Box
          component="li"
          sx={{
            '& + li': {
              borderTop: '1px solid' + grey[300]
            }
          }}
          {...renderProps}
          key={`${renderOption.tsn}-${renderOption.label}`}>
          <Box py={1} width="100%">
            <SpeciesCard taxon={renderOption} />
          </Box>
        </Box>
      )}
    />
  );
};

export default TaxonomyDataGridEditCell;
