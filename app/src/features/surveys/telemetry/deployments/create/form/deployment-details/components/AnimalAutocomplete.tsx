import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { useSurveyContext } from 'hooks/useContext';
import { ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { useState } from 'react';

export interface IAnimalAutocompleteFieldProps {
  /**
   * Formik field name.
   *
   * @type {string}
   * @memberof IAnimalAutocompleteFieldProps
   */
  formikFieldName: string;
  /**
   * The field label.
   *
   * @type {string}
   * @memberof IAnimalAutocompleteFieldProps
   */
  label: string;
  /**
   * Callback to fire on animal option selection.
   *
   * @type {(animal: ISimpleCritterWithInternalId) => void}
   * @memberof IAnimalAutocompleteFieldProps
   */
  handleAnimal: (animal: ISimpleCritterWithInternalId) => void;
  /**
   * Default animal to render for input and options.
   *
   * @type {ISimpleCritterWithInternalId}
   * @memberof IAnimalAutocompleteFieldProps
   */
  defaultAnimal?: ISimpleCritterWithInternalId;
  /**
   * The error message to display.
   *
   * Note: the calling component is responsible for checking `touched`, if needed.
   *
   * @type {string}
   * @memberof IAnimalAutocompleteFieldProps
   */
  error?: string;
  /**
   * If field is required.
   *
   * @type {boolean}
   * @memberof IAnimalAutocompleteFieldProps
   */
  required?: boolean;
  /**
   * If field is disabled.
   *
   * @type {boolean}
   * @memberof IAnimalAutocompleteFieldProps
   */
  disabled?: boolean;
  /**
   * Clear the input value after a selection is made
   * Defaults to false
   *
   * @type {boolean}
   * @memberof IAnimalAutocompleteFieldProps
   */
  clearOnSelect?: boolean;
}

const AnimalAutocompleteField = (props: IAnimalAutocompleteFieldProps) => {
  const { formikFieldName, label, required, error, handleAnimal, defaultAnimal } = props;

  const surveyContext = useSurveyContext();

  // The input field value
  const [inputValue, setInputValue] = useState(defaultAnimal?.animal_id ?? '');

  // Survey animals to choose from
  const options = surveyContext.critterDataLoader.data;

  // const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const input = event.target.value;
  //   setInputValue(input);

  //   if (!input) {
  //     setOptions([]);
  //     search.cancel();
  //     handleAnimal();
  //     return;
  //   }
  //   setIsLoading(true);
  //   search(input, (animalOptions) => {
  //     if (!isMounted()) {
  //       return;
  //     }
  //     setOptions(animalOptions);
  //     setIsLoading(false);
  //   });
  // };

  return (
    <Autocomplete
      id={props.formikFieldName}
      disabled={props.disabled}
      data-testid={props.formikFieldName}
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
        if (props.clearOnSelect && reason === 'reset') {
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
                  <Typography component="span" color="textSecondary" variant='body2'>
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
          name={formikFieldName}
          onChange={(event) => setInputValue(event.currentTarget.value)}
          required={required}
          label={label}
          variant="outlined"
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
          error={Boolean(error)}
          helperText={error}
        />
      )}
    />
  );
};

export default AnimalAutocompleteField;
