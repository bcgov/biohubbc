import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { LocalizationProvider, TimePicker, TimePickerProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { default as dayjs } from 'dayjs';
import { useRef } from 'react';

interface ITimePickerDataGridProps<DataGridType extends GridValidRowModel> {
  dateFieldProps?: TimePickerProps<any>;
  dataGridProps: GridRenderEditCellParams<DataGridType>;
}

const TimePickerDataGrid = <DataGridType extends GridValidRowModel>({
  dateFieldProps,
  dataGridProps
}: ITimePickerDataGridProps<DataGridType>) => {
  const ref = useRef<HTMLInputElement>(null);

  useEnhancedEffect(() => {
    if (dataGridProps.hasFocus) {
      ref.current?.focus();
    }
  }, [dataGridProps.hasFocus]);

  const { slotProps, ...rest } = dateFieldProps ?? {};

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        slotProps={{
          ...slotProps,
          textField: {
            fullWidth: true,
            ...slotProps?.textField
          }
        }}
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
        views={['hours', 'minutes', 'seconds']}
        timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
        ampm={false}
        {...rest}
      />
    </LocalizationProvider>
  );
};

export default TimePickerDataGrid;
