import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import { GridRenderEditCellParams, GridValidRowModel, useGridApiContext } from '@mui/x-data-grid';
import { DatePicker, DatePickerProps, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { useRef } from 'react';

interface IDatePickerDataGridProps<DataGridType extends GridValidRowModel> {
  dateFieldProps?: DatePickerProps<any>;
  dataGridProps: GridRenderEditCellParams<DataGridType>;
}

const DatePickerDataGrid = <DataGridType extends GridValidRowModel>({
  dateFieldProps,
  dataGridProps
}: IDatePickerDataGridProps<DataGridType>) => {
  const apiRef = useGridApiContext();
  const ref = useRef<HTMLInputElement>(null);
  useEnhancedEffect(() => {
    if (dataGridProps.hasFocus) {
      ref.current?.focus();
    }
  }, [dataGridProps.hasFocus]);
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        inputRef={ref}
        value={(dataGridProps.value && moment(dataGridProps.value, 'HH:mm:ss')) || null}
        onChange={(value) => {
          apiRef?.current.setEditCellValue({ id: dataGridProps.id, field: dataGridProps.field, value: value });
        }}
        onAccept={(value) => {
          apiRef?.current.setEditCellValue({
            id: dataGridProps.id,
            field: dataGridProps.field,
            value: value?.format('HH:mm:ss')
          });
        }}
        {...dateFieldProps}
      />
    </LocalizationProvider>
  );
};

export default DatePickerDataGrid;
