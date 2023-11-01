import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import { GridRenderEditCellParams, GridValidRowModel, useGridApiContext } from '@mui/x-data-grid';
import { LocalizationProvider, TimePicker, TimePickerProps } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { useRef } from 'react';

interface ITimePickerDataGridProps<DataGridType extends GridValidRowModel> {
  dateFieldProps?: TimePickerProps<any>;
  dataGridProps: GridRenderEditCellParams<DataGridType>;
}

const TimePickerDataGrid = <DataGridType extends GridValidRowModel>({
  dateFieldProps,
  dataGridProps
}: ITimePickerDataGridProps<DataGridType>) => {
  const apiRef = useGridApiContext();
  const ref = useRef<HTMLInputElement>(null);
  useEnhancedEffect(() => {
    if (dataGridProps.hasFocus) {
      ref.current?.focus();
    }
  }, [dataGridProps.hasFocus]);
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <TimePicker
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
        views={['hours', 'minutes', 'seconds']}
        timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
        ampm={false}
        {...dateFieldProps}
      />
    </LocalizationProvider>
  );
};

export default TimePickerDataGrid;