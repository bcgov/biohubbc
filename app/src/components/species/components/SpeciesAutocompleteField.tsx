import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import TextField from '@mui/material/TextField';
import SpeciesCard from 'components/species/components/SpeciesCard';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useIsMounted from 'hooks/useIsMounted';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { debounce } from 'lodash-es';
import { ChangeEvent, useMemo, useState } from 'react';

export interface ISpeciesAutocompleteFieldProps {
  /**
   * Formik field name.
   *
   * @type {string}
   * @memberof ISpeciesAutocompleteFieldProps
   */
  formikFieldName: string;
  /**
   * The field label.
   *
   * @type {string}
   * @memberof ISpeciesAutocompleteFieldProps
   */
  label: string;
  /**
   * Callback to fire on species option selection.
   *
   * @type {(species: ITaxonomy) => void}
   * @memberof ISpeciesAutocompleteFieldProps
   */
  handleSpecies: (species?: ITaxonomy) => void;
  /**
   * Default species to render for input and options.
   *
   * @type {ITaxonomy}
   * @memberof ISpeciesAutocompleteFieldProps
   */
  defaultSpecies?: ITaxonomy;
  /**
   * The error message to display.
   *
   * Note: the calling component is responsible for checking `touched`, if needed.
   *
   * @type {string}
   * @memberof ISpeciesAutocompleteFieldProps
   */
  error?: string;
  /**
   * If field is required.
   *
   * @type {boolean}
   * @memberof ISpeciesAutocompleteFieldProps
   */
  required?: boolean;
  /**
   * If field is disabled.
   *
   * @type {boolean}
   * @memberof ISpeciesAutocompleteFieldProps
   */
  disabled?: boolean;
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
  const { formikFieldName, label, required, error, handleSpecies, defaultSpecies } = props;

  const biohubApi = useBiohubApi();
  const isMounted = useIsMounted();

  const [inputValue, setInputValue] = useState(defaultSpecies?.scientificName ?? '');
  const [options, setOptions] = useState<ITaxonomy[]>(defaultSpecies ? [defaultSpecies] : []);
  // Is control loading (search in progress)
  const [isLoading, setIsLoading] = useState(false);

  const search = useMemo(
    () =>
      debounce(async (inputValue: string, callback: (searchedValues: ITaxonomy[]) => void) => {
        const searchTerms = inputValue.split(' ').filter(Boolean);
        // TODO: Add error handling if this call throws an error
        const response = await biohubApi.taxonomy.searchSpeciesByTerms(searchTerms);

        callback(response);
      }, 500),
    [biohubApi.taxonomy]
  );

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setInputValue(input);

    if (!input) {
      setOptions([]);
      search.cancel();
      handleSpecies();
      return;
    }
    setIsLoading(true);
    search(input, (speciesOptions) => {
      if (!isMounted()) {
        return;
      }
      setOptions(speciesOptions);
      setIsLoading(false);
    });
  };

  return (
    <Autocomplete
      id={props.formikFieldName}
      disabled={props.disabled}
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
      onInputChange={(_, _value, reason) => {
        if (props.clearOnSelect && reason === 'reset') {
          setInputValue('');
        }
      }}
      onChange={(_, option) => {
        if (option) {
          handleSpecies(option);
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
            {...renderProps}
            key={renderOption.tsn}>
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
          onChange={handleOnChange}
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
          error={Boolean(error)}
          helperText={error}
        />
      )}
    />
  );
};

export default SpeciesAutocompleteField;
