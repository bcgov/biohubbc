import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';
import { useCodesContext } from 'hooks/useContext';
import { TelemetryDevice } from 'interfaces/useTelemetryDeviceApi.interface';
import { get } from 'lodash-es';
import { useEffect, useState } from 'react';

export interface IDeviceAutocompleteFieldProps {
  /**
   * Formik field name.
   *
   * @type {string}
   * @memberof IDeviceAutocompleteFieldProps
   */
  formikFieldName: string;
  /**
   * The field label.
   *
   * @type {string}
   * @memberof IDeviceAutocompleteFieldProps
   */
  label: string;
  /**
   * The array of options to choose from.
   *
   * @type {TelemetryDevice[]}
   * @memberof IDeviceAutocompleteFieldProps
   */
  options: TelemetryDevice[];
  /**
   * Callback fired on option selection.
   *
   * @memberof IDeviceAutocompleteFieldProps
   */
  onSelect: (device: TelemetryDevice) => void;
  /**
   * Optional callback fired on option de-selected/cleared.
   *
   * @memberof IDeviceAutocompleteFieldProps
   */
  onClear?: () => void;
  /**
   * Default device to render for input and options.
   *
   * @type {TelemetryDevice}
   * @memberof IDeviceAutocompleteFieldProps
   */
  defaultDevice?: TelemetryDevice;
  /**
   * If field is required.
   *
   * @type {boolean}
   * @memberof IDeviceAutocompleteFieldProps
   */
  required?: boolean;
  /**
   * If field is disabled.
   *
   * @type {boolean}
   * @memberof IDeviceAutocompleteFieldProps
   */
  disabled?: boolean;
  /**
   * If `true`, clears the input field after a selection is made.
   *
   * @memberof IDeviceAutocompleteFieldProps
   */
  clearOnSelect?: boolean;
  /**
   * Placeholder text for the TextField
   *
   * @type {string}
   * @memberof IDeviceAutocompleteFieldProps
   */
  placeholder?: string;
}

/**
 * An autocomplete field for selecting an existing device from the Survey.
 *
 * @template T
 * @param {IDeviceAutocompleteFieldProps<T>} props
 * @return {*}
 */
export const DeviceAutocompleteField = <T extends string | number>(props: IDeviceAutocompleteFieldProps) => {
  const { formikFieldName, label, options, onSelect, defaultDevice, required, disabled, clearOnSelect, placeholder } =
    props;

  const { touched, errors, setFieldValue } = useFormikContext<IAutocompleteFieldOption<T>>();

  const codesContext = useCodesContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  // The input field value
  const [inputValue, setInputValue] = useState(String(defaultDevice?.device_id ?? ''));

  useEffect(() => {
    if (!defaultDevice) {
      return;
    }

    // Set the input value to the default device's serial
    setInputValue(String(defaultDevice.serial));
  }, [defaultDevice]);

  return (
    <Autocomplete
      id={formikFieldName}
      disabled={disabled}
      data-testid={formikFieldName}
      filterSelectedOptions
      noOptionsText="No matching options"
      options={options ?? []}
      getOptionLabel={(option) => option.serial}
      filterOptions={createFilterOptions()}
      isOptionEqualToValue={(option, value) => {
        return option.device_id === value.device_id;
      }}
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
          setInputValue(String(option.serial));
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
            key={renderOption.device_id}>
            <Box py={1} width="100%">
              <Box justifyContent="space-between" display="flex">
                <Typography fontWeight={700}>{renderOption.serial}&nbsp;</Typography>
                <Typography color="textSecondary">
                  {
                    codesContext.codesDataLoader.data?.telemetry_device_makes.find(
                      (make) => make.id === renderOption.device_make_id
                    )?.name
                  }
                </Typography>
              </Box>
              <Typography color="textSecondary" variant="body2">
                {renderOption.model}
              </Typography>
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
          placeholder={placeholder ?? 'Search for a device in the Survey'}
          InputProps={{
            ...params.InputProps,
            endAdornment: <>{params.InputProps.endAdornment}</>
          }}
        />
      )}
    />
  );
};
