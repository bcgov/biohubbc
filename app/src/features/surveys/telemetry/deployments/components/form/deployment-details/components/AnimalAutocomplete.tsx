import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { get } from 'lodash-es';
import { useState } from 'react';

export interface IAutocompleteField<T extends string | number> {
  name: string;
  label: string;
  handleAnimal: (animal: ISimpleCritterWithInternalId) => void;
  getOptionDisabled?: (option: IAutocompleteFieldOption<T>) => boolean;
  defaultAnimal?: ISimpleCritterWithInternalId;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  clearOnSelect?: boolean;
}

const AnimalAutocompleteField = <T extends string | number>(props: IAutocompleteField<T>) => {
  const { name, label, required, handleAnimal, defaultAnimal } = props;

  const { touched, errors, setFieldValue } = useFormikContext<IAutocompleteFieldOption<T>>();

  const surveyContext = useSurveyContext();

  // The input field value
  const [inputValue, setInputValue] = useState(defaultAnimal?.animal_id ?? '');

  // Survey animals to choose from
  const options = surveyContext.critterDataLoader.data;

  return (
    <Autocomplete
      id={props.name}
      disabled={props.disabled}
      data-testid={props.name}
      filterSelectedOptions
      noOptionsText="No matching options"
      options={options ?? []}
      getOptionLabel={(option) => option.animal_id ?? option.critter_id}
      isOptionEqualToValue={(option, value) => {
        return option.critter_id === value.critter_id;
      }}
      filterOptions={(item) => item}
      inputValue={inputValue}
      onInputChange={(_, _value, reason) => {
        if (props.clearOnSelect && reason === 'clear') {
          setFieldValue(name, '');
          setInputValue('');
        }
      }}
      onChange={(_, option) => {
        if (option) {
          handleAnimal(option);
          setInputValue(option.animal_id ?? option.critter_id); //startCase(option?.commonNames?.length ? option.commonNames[0] : option.scientificName));
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
            key={renderOption.critter_id}
            {...renderProps}>
            <Box py={1} width="100%">
              <Box justifyContent="space-between" display="flex">
                <Typography fontWeight={700}>
                  {renderOption.animal_id}&nbsp;
                  <Typography component="span" color="textSecondary" variant="body2">
                    {renderOption.wlh_id}
                  </Typography>
                </Typography>
                <Typography color="textSecondary">{renderOption.survey_critter_id}</Typography>
              </Box>
              <ScientificNameTypography name={renderOption.itis_scientific_name} color="textSecondary" />
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          onChange={(event) => setInputValue(event.currentTarget.value)}
          required={required}
          label={label}
          variant="outlined"
          sx={{ opacity: props?.disabled ? 0.25 : 1 }}
          error={get(touched, props.name) && Boolean(get(errors, props.name))}
          helperText={get(touched, props.name) && get(errors, props.name)}
          fullWidth
          placeholder="Search for an animal in the Survey"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {surveyContext.critterDataLoader.isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  );
};

export default AnimalAutocompleteField;
