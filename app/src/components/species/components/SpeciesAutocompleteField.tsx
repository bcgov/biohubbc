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
import { IPartialTaxonomy, ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { debounce, startCase } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

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
   * @type {(species: ITaxonomy | IPartialTaxonomy) => void}
   * @memberof ISpeciesAutocompleteFieldProps
   */
  handleSpecies: (species?: ITaxonomy | IPartialTaxonomy) => void;
  /**
   * Optional callback to fire on species option being cleared
   *
   * @memberof ISpeciesAutocompleteFieldProps
   */
  handleClear?: () => void;
  /**
   * Default species to render for input and options.
   *
   * @type {ITaxonomy | IPartialTaxonomy}
   * @memberof ISpeciesAutocompleteFieldProps
   */
  defaultSpecies?:
    | ITaxonomy
    | IPartialTaxonomy
    | Promise<ITaxonomy | null | undefined>
    | Promise<IPartialTaxonomy | null | undefined>;
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
   * Whether to show start adornment magnifying glass or not
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
}

/**
 * Autocomplete field for searching for and selecting a single taxon.
 *
 * Note: Depends on the external BioHub API for fetching species records.
 *
 * @param {ISpeciesAutocompleteFieldProps} props
 * @return {*}
 */
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
    showStartAdornment
  } = props;

  const biohubApi = useBiohubApi();
  const isMounted = useIsMounted();

  // A default species has been provided and it is not a promise
  const isDefaultSpecies = defaultSpecies && !('then' in defaultSpecies);

  // The input field value
  const [inputValue, setInputValue] = useState<string>(isDefaultSpecies ? defaultSpecies?.scientificName : '');
  // The array of options to choose from
  const [options, setOptions] = useState<(ITaxonomy | IPartialTaxonomy)[]>(isDefaultSpecies ? [defaultSpecies] : []);
  // Is control loading (search in progress)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (defaultSpecies && 'then' in defaultSpecies) {
      // A default species has been provided and it is a promise
      defaultSpecies.then((taxonomy) => {
        if (!isMounted()) {
          return;
        }

        if (inputValue !== '') {
          // Input value has been set by the user, do not override it
          return;
        }

        if (!taxonomy) {
          return;
        }

        setInputValue(taxonomy.scientificName);
        setOptions([taxonomy]);
      });
    }
  }, [defaultSpecies, inputValue, isMounted]);

  const handleSearch = useMemo(
    () =>
      debounce(async (inputValue: string, callback: (searchedValues: ITaxonomy[]) => void) => {
        const searchTerms = inputValue.split(' ').filter(Boolean);
        const response = await biohubApi.taxonomy.searchSpeciesByTerms(searchTerms).catch(() => {
          return [];
        });

        callback(response);
      }, 500),
    [biohubApi.taxonomy]
  );

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
      // Text field value changed
      onInputChange={(_, value, reason) => {
        if (reason === 'reset') {
          if (clearOnSelect) {
            setInputValue('');
            setOptions([]);
            handleClear?.();
          }
          return;
        }

        if (reason === 'clear') {
          setInputValue('');
          setOptions([]);
          handleClear?.();
          return;
        }

        if (!value) {
          setInputValue('');
          setOptions([]);
          return;
        }

        setIsLoading(true);
        setInputValue(value);
        handleSearch(value, (newOptions) => {
          if (!isMounted()) {
            return;
          }
          setOptions(() => newOptions);
          setIsLoading(false);
        });
      }}
      // Option selected from dropdown
      onChange={(_, option) => {
        if (!option) {
          handleClear?.();
          return;
        }

        handleSpecies(option);

        if (clearOnSelect) {
          setInputValue('');
          return;
        }

        setInputValue(startCase(option?.commonNames?.length ? option.commonNames[0] : option.scientificName));
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
              <SpeciesCard taxon={renderOption} />
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
