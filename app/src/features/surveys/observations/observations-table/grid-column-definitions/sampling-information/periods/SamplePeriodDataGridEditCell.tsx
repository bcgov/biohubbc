import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { IAutocompleteDataGridSamplePeriodOption } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/periods/SamplePeriodDataGrid.interface';
import { getCurrentPeriod } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/utils';
import { SampleLocationCache } from 'features/surveys/observations/observations-table/ObservationsTableContainer';
import { MutableRefObject, useRef } from 'react';

export interface ISamplePeriodDataGridEditCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderCellParams<DataGridType>;
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>;
  periodOptions: IAutocompleteDataGridSamplePeriodOption[];
  onSelectOption?: (selectedSampleSite: IAutocompleteDataGridSamplePeriodOption | null) => void;
  error?: boolean;
}

/**
 *
 *
 * @template DataGridType
 * @param {ISamplePeriodDataGridEditCellProps<DataGridType>} props
 * @return {*}
 */
const SamplePeriodDataGridEditCell = <DataGridType extends GridValidRowModel>(
  props: ISamplePeriodDataGridEditCellProps<DataGridType>
) => {
  const { dataGridProps, cachedSampleLocationsRef, periodOptions, onSelectOption, error } = props;

  const ref = useRef<HTMLInputElement>();

  useEnhancedEffect(() => {
    if (dataGridProps.hasFocus) {
      ref.current?.focus();
    }
  }, [dataGridProps.hasFocus]);

  function getCurrentValue() {
    const currentPeriod = getCurrentPeriod(dataGridProps, cachedSampleLocationsRef);

    return currentPeriod;
  }

  return (
    <Autocomplete
      id={`${dataGridProps.id}[${dataGridProps.field}]`}
      noOptionsText="No matching options"
      autoHighlight={true}
      fullWidth
      blurOnSelect
      handleHomeEndKeys
      value={getCurrentValue()}
      options={periodOptions}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => {
        if (!option?.value || !value?.value) {
          return false;
        }
        return option.value === value.value;
      }}
      filterOptions={createFilterOptions({ limit: 50 })}
      onChange={(_, selectedOption) => {
        // Set the sample period value with selected options value
        dataGridProps.api.setEditCellValue({
          id: dataGridProps.id,
          field: dataGridProps.field,
          value: selectedOption?.value
        });

        onSelectOption?.(selectedOption);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={ref}
          size="small"
          variant="outlined"
          fullWidth
          InputProps={{
            color: error ? 'error' : undefined,
            ...params.InputProps
          }}
          error={error}
        />
      )}
      renderOption={(renderProps, renderOption) => {
        return (
          <Box component="li" {...renderProps} key={renderProps.id}>
            {renderOption.label}
          </Box>
        );
      }}
      data-testid={dataGridProps.id}
    />
  );
};

export default SamplePeriodDataGridEditCell;
