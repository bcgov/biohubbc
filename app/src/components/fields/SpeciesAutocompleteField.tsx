import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import { Collapse } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import AlertBar from 'components/alert/AlertBar';
import SpeciesCard from 'components/species/SpeciesCard';
import SpeciesSelectedCard from 'components/species/SpeciesSelectedCard';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ITaxonomy } from 'interfaces/useTaxonomy.interface';
import { debounce } from 'lodash-es';
import get from 'lodash-es/get';
import { default as React, useEffect, useMemo, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';

export interface ISpeciesAutocompleteFieldProps {
  formikFieldName: string;
  label: string;
  required?: boolean;
}

export type ISpeciesAutocompleteField = {
  id: number;
  label: string;
};

const SpeciesAutocompleteField: React.FC<ISpeciesAutocompleteFieldProps> = (props) => {
  const biohubApi = useBiohubApi();

  const { values, setFieldValue, errors, setErrors } = useFormikContext<ISpeciesAutocompleteField[]>();
  console.log('errors', errors);

  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<ISpeciesAutocompleteField[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<ISpeciesAutocompleteField[]>([]);

  const selectedValues: number[] = get(values, props.formikFieldName) || [];

  const handleAddSpecies = (species: ISpeciesAutocompleteField) => {
    selectedSpecies.push(species);

    setFieldValue(`${props.formikFieldName}[${selectedSpecies.length - 1}]`, species.id);
    setOptions([]);
    clearErrors();
  };

  const handleRemoveSpecies = (species_id: number) => {
    const filteredSpecies = selectedSpecies.filter((item: ISpeciesAutocompleteField) => item.id !== species_id);
    const filteredValues = selectedValues.filter((value: number) => {
      return value !== species_id;
    });

    setSelectedSpecies(filteredSpecies);
    setFieldValue(props.formikFieldName, filteredValues);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const handleGetInitList = async (initialValues: number[]) => {
    return biohubApi.taxonomy.getSpeciesFromIds(initialValues);
  };

  const convertSearchResponseToOptions = (searchResponse: ITaxonomy[]) => {
    return searchResponse.map((item: ITaxonomy) => {
      return {
        id: Number(item.id),
        label: item.label
      } as ISpeciesAutocompleteField;
    });
  };

  const handleSearch = useMemo(
    () =>
      debounce(async (inputValue: string, callback: (searchedValues: ISpeciesAutocompleteField[]) => void) => {
        const response = await biohubApi.taxonomy.searchSpecies(inputValue);

        const newOptions = convertSearchResponseToOptions(response.searchResponse);

        callback(newOptions);
      }, 500),
    [biohubApi.taxonomy]
  );

  const apiSearchTypeHelpers = {
    async loadOptionsForSelectedValues() {
      const response = await handleGetInitList(selectedValues);

      setSelectedSpecies(convertSearchResponseToOptions(response.searchResponse));
    },
    async searchSpecies() {
      if (!inputValue) {
        setOptions([]);
        handleSearch.cancel();
      } else {
        handleSearch(inputValue, (newOptions) => {
          if (newOptions.length) {
            setOptions(newOptions);
          }
        });
      }
    }
  };

  useEffect(() => {
    apiSearchTypeHelpers && apiSearchTypeHelpers.loadOptionsForSelectedValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValues]);

  useEffect(() => {
    apiSearchTypeHelpers && apiSearchTypeHelpers.searchSpecies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  return (
    <>
      <Autocomplete
        id={props.formikFieldName}
        data-testid={props.formikFieldName}
        filterSelectedOptions
        noOptionsText="No matching options"
        options={options}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => {
          return option.id === value.id;
        }}
        filterOptions={(options, state) => {
          const searchFilter = createFilterOptions<ISpeciesAutocompleteField>({ ignoreCase: true });
          if (!values?.length) {
            return options;
          }

          const unselectedOptions = options.filter((item) => {
            return !values.some((existing) => existing.id === item.id);
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
            <Box component="li" {...renderProps} key={renderOption.id}>
              <SpeciesCard name={renderOption.label} subtext={renderOption.label} />
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            name={props.formikFieldName}
            required={props.required}
            label={props.label}
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
      {errors && get(errors, props.formikFieldName) && (
        <Box mt={3}>
          <AlertBar severity="error" variant="standard" title="Missing Species" text="Select a species" />
        </Box>
      )}
      <Box>
        <Box
          sx={{
            '& .userRoleItemContainer + .userRoleItemContainer': {
              mt: 1
            }
          }}>
          <TransitionGroup>
            {selectedSpecies &&
              selectedSpecies.map((species: ISpeciesAutocompleteField, index: number) => {
                return (
                  <Collapse key={species.id}>
                    <SpeciesSelectedCard
                      index={index}
                      species={species}
                      handleRemove={handleRemoveSpecies}
                      label={species.label}
                    />
                  </Collapse>
                );
              })}
          </TransitionGroup>
        </Box>
      </Box>
    </>
  );
};

export default SpeciesAutocompleteField;
