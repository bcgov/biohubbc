import TextField, { TextFieldProps } from '@mui/material/TextField/TextField';
import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { useRef } from 'react';

interface ITextFieldCustomValidation<DataGridType extends GridValidRowModel> {
  textFieldProps: TextFieldProps;
  dataGridProps: GridRenderEditCellParams<DataGridType>;
}

const TextFieldDataGrid = <DataGridType extends GridValidRowModel>({
  textFieldProps,
  dataGridProps
}: ITextFieldCustomValidation<DataGridType>) => {
  const ref = useRef<HTMLInputElement>();
  useEnhancedEffect(() => {
    if (dataGridProps.hasFocus) {
      ref.current?.focus();
    }
  }, [dataGridProps.hasFocus]);
  return (
    <TextField
      fullWidth
      inputRef={ref}
      value={dataGridProps.value ?? ''}
      variant="outlined"
      type="text"
      {...textFieldProps}
    />
  );
};

export default TextFieldDataGrid;
