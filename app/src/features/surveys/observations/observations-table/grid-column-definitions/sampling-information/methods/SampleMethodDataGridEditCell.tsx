import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { IAutocompleteDataGridSampleMethodOption } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/methods/SampleMethodDataGrid.interface';
import { getCurrentMethod } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/utils';
import { SampleLocationCache } from 'features/surveys/observations/observations-table/ObservationsTableContainer';
import { MutableRefObject, useRef } from 'react';

export interface ISampleMethodDataGridEditCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderCellParams<DataGridType>;
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>;
  methodOptions: IAutocompleteDataGridSampleMethodOption[];
  onSelectOption?: (selectedSampleSite: IAutocompleteDataGridSampleMethodOption | null) => void;
  error?: boolean;
}

/**
 *
 *
 * @template DataGridType
 * @param {ISampleMethodDataGridEditCellProps<DataGridType>} props
 * @return {*}
 */
const SampleMethodDataGridEditCell = <DataGridType extends GridValidRowModel>(
  props: ISampleMethodDataGridEditCellProps<DataGridType>
) => {
  const { dataGridProps, cachedSampleLocationsRef, methodOptions, onSelectOption, error } = props;

  const ref = useRef<HTMLInputElement>();

  useEnhancedEffect(() => {
    if (dataGridProps.hasFocus) {
      ref.current?.focus();
    }
  }, [dataGridProps.hasFocus]);

  function getCurrentValue() {
    const currentMethod = getCurrentMethod(dataGridProps, cachedSampleLocationsRef);

    return currentMethod;
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
      options={methodOptions}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => {
        if (!option?.value || !value?.value) {
          return false;
        }
        return option.value === value.value;
      }}
      filterOptions={createFilterOptions({ limit: 50 })}
      onChange={(_, selectedOption) => {
        // Set the sample method value with selected options value
        dataGridProps.api.setEditCellValue({
          id: dataGridProps.id,
          field: dataGridProps.field,
          value: selectedOption?.value
        });

        // If the sample method is changed, clear the sample period as it is dependent on the method
        dataGridProps.api.setEditCellValue({
          id: dataGridProps.id,
          field: 'survey_sample_period_id',
          value: null
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

export default SampleMethodDataGridEditCell;
