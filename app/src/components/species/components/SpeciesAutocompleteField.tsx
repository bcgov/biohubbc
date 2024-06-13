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
   * Optional callback to fire on species option being cleared
   *
   * @memberof ISpeciesAutocompleteFieldProps
   */
  handleClear?: () => void;
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
  /**
   * Whether to show start adnornment magnifying glass or not
   * Defaults to false
   *
   * @type {boolean}
   * @memberof ISpeciesAutocompleteFieldProps
   */
  showStartAdornment?: boolean;
  /**
   * Placeholder text for the TextField
   *
   * @type {string}
   * @memberof ISpeciesAutocompleteFieldProps
   */
  placeholder?: string;
  /**
   * Whether to show selected values in the textfield or not
   * Defaults to false
   *
   * @type {boolean}
   * @memberof ISpeciesAutocompleteFieldProps
   */
  showSelectedValue?: boolean;
}

const SpeciesAutocompleteField = (props: ISpeciesAutocompleteFieldProps) => {
  const {
    formikFieldName,
    clearOnSelect,
    required,
    label,
    error,
    placeholder,
    disabled,
    handleSpecies,
    handleClear,
    defaultSpecies,
    showStartAdornment,
    showSelectedValue
  } = props;

  const biohubApi = useBiohubApi();
  const isMounted = useIsMounted();

  // The input field value
  const [inputValue, setInputValue] = useState(defaultSpecies?.scientificName ?? '');
  // The array of options to choose from
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
      id={formikFieldName}
      disabled={disabled}
      data-testid={formikFieldName}
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
        if (clearOnSelect && reason === 'reset') {
          setInputValue('');
          if (handleClear) {
            handleClear();
          }
        }
      }}
      onChange={(_, option) => {
        if (option) {
          handleSpecies(option);
          setInputValue(startCase(option?.commonNames?.length ? option.commonNames[0] : option.scientificName));
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
            key={`${renderOption.tsn}-${renderOption.scientificName}`}
            {...renderProps}>
            <Box py={1} width={'100%'}>
              <SpeciesCard
                commonNames={renderOption.commonNames}
                scientificName={renderOption.scientificName}
                tsn={renderOption.tsn}
                rank={renderOption.rank}
                kingdom={renderOption.kingdom}
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
          sx={{
            '& .MuiAutocomplete-input': {
              fontStyle: inputValue.split(' ').length > 1 ? 'italic' : 'normal'
            }
          }}
          variant="outlined"
          fullWidth
          placeholder={placeholder ? placeholder : 'Enter a species or taxon'}
          InputProps={{
            ...params.InputProps,
            startAdornment: showStartAdornment && (
              <Box mx={1} mt="6px">
                <Icon path={mdiMagnify} size={1}></Icon>
              </Box>
            ),
            endAdornment: (
              <>
                {inputValue && isLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
