import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { debounce } from 'lodash-es';
import { useMemo, useState } from 'react';

export interface IMeasurementsSearchAutocompleteProps {
  /**
   * The selected measurements.
   *
   * @type {CBMeasurementType[]}
   * @memberof IMeasurementsSearchAutocompleteProps
   */
  selectedOptions: CBMeasurementType[];
  /**
   * An async function that returns an array of options, based on the provided input value.
   *
   * @memberof IMeasurementsSearchAutocompleteProps
   */
  getOptions: (inputValue: string) => Promise<CBMeasurementType[]>;
  /**
   * Callback fired on selecting options.
   *
   * Note: this is not fired until the user un-focuses the component.
   *
   * @memberof IMeasurementsSearchAutocompleteProps
   */
  onAddMeasurementColumn: (measurementColumn: CBMeasurementType) => void;
}

/**
 * Renders a search input to find and add measurements.
 *
 * @param {IMeasurementsSearchAutocompleteProps} props
 * @return {*}
 */
export const MeasurementsSearchAutocomplete = (props: IMeasurementsSearchAutocompleteProps) => {
  const { selectedOptions, getOptions, onAddMeasurementColumn } = props;

  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<CBMeasurementType[]>([]);

  const handleSearch = useMemo(
    () =>
      debounce(async (inputValue: string, callback: (searchedValues: CBMeasurementType[]) => void) => {
        const response = await getOptions(inputValue);
        callback(response);
      }, 500),
    [getOptions]
  );

  return (
    <Autocomplete
      id="measurements-autocomplete"
      data-testid="measurements-autocomplete"
      noOptionsText="No matching options"
      autoHighlight={true}
      options={options}
      disableCloseOnSelect={true}
      blurOnSelect={true}
      clearOnBlur={true}
      getOptionLabel={(option) => option.measurement_name}
      isOptionEqualToValue={(option, value) => {
        return option.taxon_measurement_id === value.taxon_measurement_id;
      }}
      filterOptions={(options) => {
        if (!selectedOptions?.length) {
          return options;
        }

        const unselectedOptions = options.filter((option) => {
          return !selectedOptions.some(
            (selectedOption) => selectedOption.taxon_measurement_id === option.taxon_measurement_id
          );
        });

        return unselectedOptions;
      }}
      inputMode="search"
      inputValue={inputValue}
      onInputChange={(_, value, reason) => {
        if (reason === 'reset') {
          return;
        }

        if (reason === 'clear') {
          setInputValue('');
          setOptions([]);
          return;
        }

        setInputValue(value);
        handleSearch(value, (newOptions) => {
          setOptions(() => newOptions);
        });
      }}
      value={null} // The selected value is not displayed in the input field or tracked by this component
      onChange={(_, value) => {
        if (value) {
          onAddMeasurementColumn(value);
          setInputValue('');
          setOptions([]);
        }
      }}
      renderOption={(renderProps, renderOption) => {
        return (
          <ListItem
            disablePadding
            divider
            sx={{
              py: '12px !important',
              px: 2
            }}
            {...renderProps}
            key={renderOption.taxon_measurement_id}
            data-testid="measurements-autocomplete-option">
            <Stack gap={0.75} mt={-0.25}>
              <Box>
                <Typography variant="body2">
                  <em>{renderOption.itis_tsn}</em>
                </Typography>
              </Box>
              <Box>
                <Typography component="div" variant="body1" fontWeight={700}>
                  {renderOption.measurement_name}
                </Typography>
                <Typography
                  component="div"
                  variant="subtitle2"
                  color="textSecondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                  {renderOption.measurement_desc}
                </Typography>
              </Box>
            </Stack>
          </ListItem>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name="measurements-autocomplete-input"
          variant="outlined"
          fullWidth
          placeholder="Enter measurement name"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Box mx={1} mt="6px">
                <Icon path={mdiMagnify} size={1}></Icon>
              </Box>
            )
          }}
          data-testid="measurements-autocomplete-input"
          aria-label="Find observation measurements"
        />
      )}
    />
  );
};
