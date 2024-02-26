import { Autocomplete, CircularProgress, createFilterOptions, TextField } from '@mui/material';
import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import { Box } from '@mui/system';
import { GridRenderEditCellParams, GridValidRowModel, useGridApiContext } from '@mui/x-data-grid';
import { IAutocompleteDataGridOption } from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';
import SpeciesCard from 'components/species/components/SpeciesCard';
import { TaxonomyContext } from 'contexts/taxonomyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import debounce from 'lodash-es/debounce';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

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

  const apiRef = useGridApiContext();

  const ref = useRef<HTMLInputElement>();

  useEnhancedEffect(() => {
    if (dataGridProps.hasFocus) {
      ref.current?.focus();
    }
  }, [dataGridProps.hasFocus]);

  // The current data grid value
  const dataGridValue = dataGridProps.value;
  // The array of options to choose from
  const [options, setOptions] = useState<IAutocompleteDataGridOption<ValueType>[]>([]);
  // The currently selected option
  const [currentOption, setCurrentOption] = useState<IAutocompleteDataGridOption<ValueType> | null>(null);
  // The input field value
  const [inputValue, setInputValue] = useState<IAutocompleteDataGridOption<ValueType>['label']>('');
  // Is control loading (search in progress)
  const [isLoading, setIsLoading] = useState(false);

  const taxonomyContext = useContext(TaxonomyContext);
  const biohubApi = useBiohubApi();

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
            label: [item.commonName, `(${item.scientificName})`].filter(Boolean).join(' ')
          }));
          onSearchResults(options);
        },
        500
      ),
    [biohubApi.taxonomy]
  );

  useEffect(() => {
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

      const response = await taxonomyContext.getCachedSpeciesTaxonomyById(id);

      if (!response) {
        return null;
      }

      return {
        value: Number(response.tsn) as ValueType,
        label: [response.commonName, `(${response.scientificName})`].filter(Boolean).join(' ')
      };
    };

    let mounted = true;

    if (!dataGridValue) {
      // No current value
      return;
    }

    if (dataGridValue === currentOption?.value) {
      // Existing value matches tracked value
      return;
    }

    const fetchCurrentOption = async () => {
      // Fetch a single option for the current value
      const response = await getCurrentOption(dataGridValue);

      if (!mounted) {
        return;
      }

      if (!response) {
        return;
      }

      setCurrentOption(response);
    };

    fetchCurrentOption();

    return () => {
      mounted = false;
    };
  }, [dataGridValue, currentOption?.value, taxonomyContext]);

  useEffect(() => {
    let mounted = true;

    if (inputValue === '') {
      // No input value, nothing to search with
      setOptions(currentOption ? [currentOption] : []);
      return;
    }

    // Call async search function
    setIsLoading(true);
    getOptions(inputValue, (searchResults) => {
      if (!mounted) {
        return;
      }

      setOptions([...searchResults]);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [inputValue, getOptions, currentOption]);

  function getCurrentValue() {
    if (!dataGridValue) {
      // No current value
      return null;
    }

    return currentOption || options.find((option) => dataGridValue === option.value) || null;
  }

  return (
    <Autocomplete
      id={`${dataGridProps.id}[${dataGridProps.field}]`}
      noOptionsText="No matching options"
      autoHighlight
      fullWidth
      blurOnSelect
      handleHomeEndKeys
      loading={isLoading}
      value={getCurrentValue()}
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => {
        if (!option?.value || !value?.value) {
          return false;
        }
        return option.value === value.value;
      }}
      filterOptions={createFilterOptions({ limit: 50 })}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={(_, selectedOption) => {
        setOptions(selectedOption ? [selectedOption, ...options] : options);
        setCurrentOption(selectedOption);

        // Set the data grid cell value with selected options value
        apiRef.current.setEditCellValue({
          id: dataGridProps.id,
          field: dataGridProps.field,
          value: selectedOption?.value
        });
      }}
      renderOption={(renderProps, renderOption) => {
        return (
          <Box component="li" {...renderProps} key={renderOption.value}>
            <SpeciesCard name={renderOption.label} subtext={String(renderOption.value)} />
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          variant="outlined"
          fullWidth
          error={props.error}
          InputProps={{
            color: props.error ? 'error' : undefined,
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
      data-testid={dataGridProps.id}
    />
  );
};

export default TaxonomyDataGridEditCell;
