import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { IAutocompleteDataGridTaxonomyOption } from 'components/data-grid/taxonomy/TaxonomyDataGrid.interface';
import { getCurrentTaxon, getTaxonsForRow } from 'components/data-grid/taxonomy/utils';
import SpeciesCard from 'components/species/components/SpeciesCard';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useTaxonomyContext } from 'hooks/useContext';
import useIsMounted from 'hooks/useIsMounted';
import debounce from 'lodash-es/debounce';
import { useMemo, useState } from 'react';

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
  const { dataGridProps, error } = props;

  const taxonomyContext = useTaxonomyContext();
  const biohubApi = useBiohubApi();

  const isMounted = useIsMounted();

  // The currently selected option
  const [currentOption, setCurrentOption] = useState<IAutocompleteDataGridTaxonomyOption | null>(
    getCurrentTaxon(dataGridProps, taxonomyContext)
  );
  const [options, setOptions] = useState<IAutocompleteDataGridTaxonomyOption[]>(
    getTaxonsForRow(dataGridProps, taxonomyContext)
  );
  // Is control loading (search in progress)
  const [isLoading, setIsLoading] = useState(false);

  const getOptions = useMemo(
    () =>
      debounce(async (searchTerm: string) => {
        if (!searchTerm) {
          return;
        }

        const searchTermsSplit = searchTerm.split(' ').filter(Boolean);

        const response = await biohubApi.taxonomy.searchSpeciesByTerms(searchTermsSplit);

        if (!isMounted()) {
          return;
        }

        const options = response.map((item) => ({
          value: item.tsn,
          label: item.scientificName,
          tsn: item.tsn,
          commonNames: item.commonNames,
          scientificName: item.scientificName,
          rank: item.rank,
          kingdom: item.kingdom
        }));

        // Set the options for the autocomplete
        setOptions(options);

        setIsLoading(false);
      }, 500),
    [biohubApi.taxonomy, isMounted]
  );

  return (
    <Autocomplete
      id={`${dataGridProps.id}[${dataGridProps.field}]`}
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

        // Set the data grid cell value with selected options value
        dataGridProps.api.setEditCellValue({
          id: dataGridProps.id,
          field: dataGridProps.field,
          value: selectedOption?.value
        });

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
          size="small"
          variant="outlined"
          fullWidth
          error={error}
          placeholder="Search for a taxon"
          InputProps={{
            color: error ? 'error' : undefined,
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
      data-testid={dataGridProps.id}
    />
  );
};

export default TaxonomyDataGridEditCell;
