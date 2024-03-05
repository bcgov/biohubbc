import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import TextField from '@mui/material/TextField';
import SpeciesCard from 'components/species/components/SpeciesCard';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

export interface ISpeciesAutocompleteFieldProps {
  formikFieldName: string;
  label: string;
  required?: boolean;
  handleAddSpecies: (species: ITaxonomy) => void;
}

const SpeciesAutocompleteField = (props: ISpeciesAutocompleteFieldProps) => {
  const { formikFieldName, label, required, handleAddSpecies } = props;
  const biohubApi = useBiohubApi();

  const { values } = useFormikContext<ITaxonomy[]>();

  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<ITaxonomy[]>([]);

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

  const searchSpecies = async () => {
    if (!inputValue) {
      setOptions([]);
      handleSearch.cancel();
    } else {
      handleSearch(inputValue, (newOptions) => {
        setOptions(newOptions);
      });
    }
  };

  useEffect(() => {
    searchSpecies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  return (
    <Autocomplete
      id={props.formikFieldName}
      data-testid={props.formikFieldName}
      filterSelectedOptions
      noOptionsText="No matching options"
      options={options}
      value={null}
      getOptionLabel={(option) => option.scientificName}
      isOptionEqualToValue={(option, value) => {
        return option.tsn === value.tsn;
      }}
      filterOptions={(options, state) => {
        const searchFilter = createFilterOptions<ITaxonomy>({ ignoreCase: true });
        if (!values?.length) {
          return options;
        }

        const unselectedOptions = options.filter((item) => {
          return !values.some((existing) => existing.tsn === item.tsn);
        });
        return searchFilter(unselectedOptions, state);
      }}
      inputValue={inputValue}
      onInputChange={(_, value, reason) => {
        if (reason === 'reset') {
          setInputValue('');
        } else {
          setInputValue(value);
        }
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
            key={`${renderOption.tsn}-${renderOption.scientificName}`}
            {...renderProps}>
            <Box py={1} width="100%">
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
            )
          }}
        />
      )}
    />
  );
};

export default SpeciesAutocompleteField;
