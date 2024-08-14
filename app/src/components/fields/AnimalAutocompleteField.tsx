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
import { ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { get } from 'lodash-es';
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
   * Callback fired on option selection.
   *
   * @memberof IAnimalAutocompleteFieldProps
   */
  onSelect: (animal: ICritterSimpleResponse) => void;
  /**
   * Optional callback fired on option de-selected/cleared.
   *
   * @memberof IAnimalAutocompleteFieldProps
   */
  onClear?: () => void;
  /**
   * Default animal to render for input and options.
   *
   * @type {ICritterSimpleResponse}
   * @memberof IAnimalAutocompleteFieldProps
   */
  defaultAnimal?: ICritterSimpleResponse;
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
   * If `true`, clears the input field after a selection is made.
   *
   * @type {ICritterSimpleResponse}
   * @memberof IAnimalAutocompleteFieldProps
   */
  clearOnSelect?: boolean;
  /**
   * Placeholder text for the TextField
   *
   * @type {string}
   * @memberof IAnimalAutocompleteFieldProps
   */
  placeholder?: string;
}

/**
 * An autocomplete field for selecting an existing animal from the Survey.
 *
 * @template T
 * @param {IAnimalAutocompleteFieldProps<T>} props
 * @return {*}
 */
export const AnimalAutocompleteField = <T extends string | number>(props: IAnimalAutocompleteFieldProps) => {
  const { formikFieldName, label, onSelect, defaultAnimal, required, disabled, clearOnSelect, placeholder } = props;

  const { touched, errors, setFieldValue } = useFormikContext<IAutocompleteFieldOption<T>>();

  const surveyContext = useSurveyContext();

  // The input field value
  const [inputValue, setInputValue] = useState(defaultAnimal?.animal_id ?? '');

  // Survey animals to choose from
  const options = surveyContext.critterDataLoader.data;

  return (
    <Autocomplete
      id={formikFieldName}
      disabled={disabled}
      data-testid={formikFieldName}
      filterSelectedOptions
      noOptionsText="No matching options"
      options={options ?? []}
      getOptionLabel={(option) => option.animal_id ?? String(option.critter_id)}
      isOptionEqualToValue={(option, value) => {
        return option.critter_id === value.critter_id;
      }}
      filterOptions={(item) => item}
      inputValue={inputValue}
      onInputChange={(_, _value, reason) => {
        if (clearOnSelect && reason === 'clear') {
          setFieldValue(formikFieldName, '');
          setInputValue('');
        }
      }}
      onChange={(_, option) => {
        if (option) {
          onSelect(option);
          setInputValue(option.animal_id ?? String(option.critter_id)); //startCase(option?.commonNames?.length ? option.commonNames[0] : option.scientificName));
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
            key={renderOption.critter_id}>
            <Box py={1} width="100%">
              <Box justifyContent="space-between" display="flex">
                <Typography fontWeight={700}>
                  {renderOption.animal_id}&nbsp;
                  <Typography component="span" color="textSecondary" variant="body2">
                    {renderOption.wlh_id}
                  </Typography>
                </Typography>
                <Typography color="textSecondary">{renderOption.critter_id}</Typography>
              </Box>
              <ScientificNameTypography name={renderOption.itis_scientific_name} color="textSecondary" />
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          name={formikFieldName}
          onChange={(event) => setInputValue(event.currentTarget.value)}
          required={required}
          sx={{ opacity: props?.disabled ? 0.25 : 1 }}
          error={get(touched, formikFieldName) && Boolean(get(errors, formikFieldName))}
          helperText={get(touched, formikFieldName) && get(errors, formikFieldName)}
          fullWidth
          placeholder={placeholder || 'Search for an animal in the Survey'}
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
