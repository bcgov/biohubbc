import { GridRenderEditCellParams, GridValidRowModel, useGridApiContext } from '@mui/x-data-grid';
import SearchAutocompleteDataGridCell, {
  IAutocompleteFieldOption
} from 'components/data-grid/SearchAutocompleteDataGrid';
import { useBiohubApi } from 'hooks/useBioHubApi';
import debounce from 'lodash-es/debounce';
import { useMemo } from 'react';

export interface ITaxonomyDataGridCellProps<T extends GridValidRowModel> {
  dataGridProps: GridRenderEditCellParams<T>;
}

const TaxonomyDataGridEditCell = <T extends GridValidRowModel>(props: ITaxonomyDataGridCellProps<T>) => {
  const { dataGridProps } = props;

  const apiRef = useGridApiContext();

  const biohubApi = useBiohubApi();

  const handleGet = async (speciesId: string | number): Promise<IAutocompleteFieldOption | null> => {
    const response = await biohubApi.taxonomy.getSpeciesFromIds([Number(speciesId)]);

    if (response.searchResponse.length !== 1) {
      return null;
    }

    return response.searchResponse.map((item) => ({ value: parseInt(item.id), label: item.label }))[0];
  };

  const handleSearch = useMemo(
    () =>
      debounce(async (inputValue: string, callback: (searchedValues: IAutocompleteFieldOption[]) => void) => {
        const response = await biohubApi.taxonomy.searchSpecies(inputValue);
        const newOptions = response.searchResponse.map((item) => ({ value: parseInt(item.id), label: item.label }));
        callback(newOptions);
      }, 500),
    [biohubApi.taxonomy]
  );

  return (
    <SearchAutocompleteDataGridCell
      dataGridProps={dataGridProps}
      get={handleGet}
      search={handleSearch}
      onChange={(event, selectedOption, reason) => {
        console.log('onChange', selectedOption);
        apiRef.current.setEditCellValue({
          id: dataGridProps.id,
          field: dataGridProps.field,
          value: selectedOption?.value
        });
      }}
    />
  );
};

export default TaxonomyDataGridEditCell;
