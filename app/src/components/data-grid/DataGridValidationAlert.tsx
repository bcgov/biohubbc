import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Icon from '@mdi/react';
import Typography from '@mui/material/Typography';
import { useState, useMemo, useCallback } from 'react';
import { mdiChevronDown, mdiChevronUp, mdiClose } from '@mdi/js';
import { GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';

export type RowValidationError<T> = { column: keyof T, error: string };
export type TableValidationModel<T> = Record<GridRowId, RowValidationError<T>[]>;

interface ITableValidationError<T> extends RowValidationError<T> {
  rowId: GridRowId;
}

export interface IDataGridErrorViewerProps<RowType> {
  validationModel: TableValidationModel<RowType>;
  muiDataGridApiRef: GridApiCommunity;
}

const DataGridValidationAlert = <RowType extends Record<any, any>>(props: IDataGridErrorViewerProps<RowType>) => {
  const [index, setIndex] = useState<number>(0);

  const sortedErrors: ITableValidationError<RowType>[] = useMemo(() => {
    const sortedRowIds = props.muiDataGridApiRef.getSortedRowIds();

    return Object
      .keys(props.validationModel)
      .sort((a: GridRowId, b: GridRowId) => {
        return sortedRowIds.indexOf(b) - sortedRowIds.indexOf(a);
      })
      .reduce((errors: ITableValidationError<RowType>[], rowId: GridRowId) => {
        return errors.concat(props.validationModel[rowId].map((rowError) => ({ ...rowError, rowId })));
      }, []);

  }, [props.validationModel, props.muiDataGridApiRef.getSortedRowIds]);

  const numErrors = useMemo(() => sortedErrors.length, [sortedErrors]);

  const handlePrev = useCallback(() => {
    setIndex((prev) => prev === 0 ? numErrors - 1 : prev - 1);
  }, [numErrors]);

  const handleNext = useCallback(() => {
    setIndex((prev) => prev >= numErrors ? 0 : prev + 1);
  }, [numErrors]);

  return (
    <Alert
      variant='outlined'
      severity='error'
      action={
        <Box display='flex' flexDirection='row' alignItems='center'>
          <Typography>{index}/{numErrors}</Typography>
          <Divider orientation='vertical' flexItem variant='middle' sx={{ ml: 2, mr: 1, borderColor: 'inherit' }} />
          <Button color="inherit" startIcon={<Icon path={mdiChevronUp} size={1} />} onClick={() => handlePrev()}>
            Prev
          </Button>
          <Button color="inherit" startIcon={<Icon path={mdiChevronDown} size={1} />} onClick={() => handleNext()}>
            Next
          </Button>
          <IconButton color='inherit'>
            <Icon path={mdiClose} size={1} />
          </IconButton>
        </Box>
      }>
      <AlertTitle>Could not save observations: Validation failed</AlertTitle>
      <Typography variant='body2'><strong>Error {index}/{numErrors}</strong>: Missing required column: Sampling Period</Typography>
    </Alert>
  )
}

export default DataGridValidationAlert
