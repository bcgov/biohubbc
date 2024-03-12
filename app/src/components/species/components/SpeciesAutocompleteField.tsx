import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import TextField from '@mui/material/TextField';
import SpeciesCard from 'components/species/components/SpeciesCard';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

export interface ISpeciesAutocompleteFieldProps {
  formikFieldName: string;
  label: string;
  required?: boolean;
  handleAddSpecies: (species: ITaxonomy) => void;
  value?: string;
  /**
   * Clear the input value after a selection is made
   * Defaults to false
   *
   * @type {boolean}
   * @memberof ISpeciesAutocompleteFieldProps
   */
  clearOnSelect?: boolean;
}

const SpeciesAutocompleteField = (props: ISpeciesAutocompleteFieldProps) => {
  const { formikFieldName, label, required, handleAddSpecies } = props;
  const biohubApi = useBiohubApi();

  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<ITaxonomy[]>([]);
  // Is control loading (search in progress)
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useMemo(
    () =>
      debounce(async (inputValue: string, callback: (searchedValues: ITaxonomy[]) => void) => {
        const searchTerms = inputValue.split(' ').filter(Boolean);
        // TODO: Add error handling if this call throws an error
        const response = await biohubApi.taxonomy.searchSpeciesByTerms(searchTerms);

        callback(response);
      }, 500),
    [biohubApi.taxonomy]
  );

  useEffect(() => {
    let mounted = true;

    if (!inputValue) {
      setOptions([]);
      handleSearch.cancel();
    } else {
      setIsLoading(true);
      handleSearch(inputValue, (newOptions) => {
        if (!mounted) {
          return;
        }

        setOptions(newOptions);
        setIsLoading(false);
      });
    }

    return () => {
      mounted = false;
    };
  }, [handleSearch, inputValue]);

  return (
    <Autocomplete
      id={props.formikFieldName}
      data-testid={props.formikFieldName}
      filterSelectedOptions
      noOptionsText="No matching options"
      options={options}
      getOptionLabel={(option) => option.scientificName}
      isOptionEqualToValue={(option, value) => {
        return option.tsn === value.tsn;
      }}
      filterOptions={(item) => item}
      inputValue={inputValue}
      onInputChange={(_, value, reason) => {
        if (props.clearOnSelect && reason === 'reset') {
          setInputValue('');
          return;
        }

        setInputValue(value);
      }}
      onChange={(_, option) => {
        if (option) {
          handleAddSpecies(option);
        }
      }}
      renderOption={(renderProps, renderOption) => {
        return (
          <Box
            component="li"
            sx={{
              '& + li': {
                borderTop: '1px solid' + grey[300]
              }
            }}
            key={renderOption.tsn}
            {...renderProps}>
            <Box py={1} width="100%">
              <SpeciesCard
                commonName={renderOption.commonName}
                scientificName={renderOption.scientificName}
                tsn={renderOption.tsn}
              />
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name={formikFieldName}
          required={required}
          label={label}
          variant="outlined"
          fullWidth
          placeholder="Type to start searching"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Box mx={1} mt="6px">
                <Icon path={mdiMagnify} size={1}></Icon>
              </Box>
            ),
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  );
};

export default SpeciesAutocompleteField;
