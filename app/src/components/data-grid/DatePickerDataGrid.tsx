import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { DatePicker, DatePickerProps, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { default as dayjs } from 'dayjs';
import { useRef } from 'react';

interface IDatePickerDataGridProps<DataGridType extends GridValidRowModel> {
  dateFieldProps?: DatePickerProps<any>;
  dataGridProps: GridRenderEditCellParams<DataGridType>;
}

const DatePickerDataGrid = <DataGridType extends GridValidRowModel>({
  dateFieldProps,
  dataGridProps
}: IDatePickerDataGridProps<DataGridType>) => {
  const ref = useRef<HTMLInputElement>(null);

  useEnhancedEffect(() => {
    if (dataGridProps.hasFocus) {
      ref.current?.focus();
    }
  }, [dataGridProps.hasFocus]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        inputRef={ref}
        value={(dataGridProps.value && dayjs(dataGridProps.value, 'HH:mm:ss')) || null}
        onChange={(value) => {
          dataGridProps.api.setEditCellValue({ id: dataGridProps.id, field: dataGridProps.field, value: value });
        }}
        onAccept={(value) => {
          dataGridProps.api.setEditCellValue({
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
