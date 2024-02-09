import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { debounce } from 'lodash-es';
import { useMemo, useState } from 'react';

export interface IMeasurementsSearchAutocompleteProps {
  /**
   * The selected measurements.
   *
   * @type {Measurement[]}
   * @memberof IMeasurementsSearchAutocompleteProps
   */
  selectedOptions: Measurement[];
  /**
   * An async function that returns an array of options, based on the provided input value.
   *
   * @memberof IMeasurementsSearchAutocompleteProps
   */
  getOptions: (inputValue: string) => Promise<Measurement[]>;
  /**
   * Callback fired on selecting options.
   *
   * Note: this is not fired until the user un-focuses the component.
   *
   * @memberof IMeasurementsSearchAutocompleteProps
   */
  onSelectOptions: (measurements: Measurement[]) => void;
}

/**
 * Renders a search input to find and add measurements.
 *
 * @param {IMeasurementsSearchAutocompleteProps} props
 * @return {*}
 */
const MeasurementsSearchAutocomplete = (props: IMeasurementsSearchAutocompleteProps) => {
  const { selectedOptions, getOptions, onSelectOptions } = props;

  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Measurement[]>([]);

  const [pendingSelectedOptions, setPendingSelectedOptions] = useState<Measurement[]>([]);

  const handleSearch = useMemo(
    () =>
      debounce(async (inputValue: string, callback: (searchedValues: Measurement[]) => void) => {
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
      multiple={true}
      disableCloseOnSelect={true}
      blurOnSelect={false}
      clearOnBlur={false}
      getOptionLabel={(option) => option.commonName || option.scientificName}
      isOptionEqualToValue={(option, value) => {
        return option.uuid === value.uuid;
      }}
      filterOptions={(options) => {
        if (!selectedOptions?.length) {
          return options;
        }

        const unselectedOptions = options.filter((option) => {
          return !selectedOptions.some((selectedOption) => selectedOption.uuid === option.uuid);
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
      value={[]} // The selected value is not displayed in the input field or tracked by this component
      onChange={(_, option) => {
        setPendingSelectedOptions((currentPendingOptions) => {
          return [...currentPendingOptions, ...option];
        });
      }}
      onClose={() => {
        onSelectOptions(pendingSelectedOptions);
        setPendingSelectedOptions([]);
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
            key={renderOption.uuid}
            data-testid="measurements-autocomplete-option">
            <Checkbox
              icon={<CheckBoxOutlineBlank fontSize="small" />}
              checkedIcon={<CheckBox fontSize="small" />}
              checked={pendingSelectedOptions.some((option) => option.uuid === renderOption.uuid)}
              value={renderOption.uuid}
              color="default"
            />
            <Stack gap={0.75} mt={-0.25}>
              <Box>
                <Typography variant="body2">
                  <em>{renderOption.scientificName}</em>&nbsp;
                  {renderOption.commonName ? (
                    <span>({renderOption.commonName})</span>
                  ) : (
                    ''
                  )}
                </Typography>
              </Box>
              <Box>
                <Typography component="div" variant="body1" fontWeight={700}>
                  {renderOption.measurementName}
                </Typography>
                <Typography component="div" variant="subtitle2" color="textSecondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {renderOption.measurementDescription}
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

export default MeasurementsSearchAutocomplete;
