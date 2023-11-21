import { mdiChevronDown, mdiChevronUp, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { Collapse } from '@mui/material';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type RowValidationError<T> = { field: keyof T; message: string };
export type TableValidationModel<T> = Record<GridRowId, RowValidationError<T>[]>;

interface ITableValidationError<T> extends RowValidationError<T> {
  rowId: GridRowId;
}

export interface IDataGridErrorViewerProps<RowType> {
  validationModel: TableValidationModel<RowType>;
  muiDataGridApiRef: GridApiCommunity;
}

const DataGridValidationAlert = <RowType extends Record<any, any>>(props: IDataGridErrorViewerProps<RowType>) => {
  const [hideAlert, setHideAlert] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(0);
  // const [sortedErrors, setSortedErrors] = useState<ITableValidationError<RowType>[]>([]);

  const sortedRowIds = useMemo(
    () => props.muiDataGridApiRef?.getSortedRowIds?.() ?? [],
    [props.muiDataGridApiRef.getSortedRowIds]
  );

  const numErrors = Object.values(props.validationModel).reduce((total, errors) => total + errors.length, 0);

  const sortedErrors: ITableValidationError<RowType>[] = useMemo(() => {
    const sortedEditableColumnNames = (props.muiDataGridApiRef?.getAllColumns?.() ?? [])
      .filter((column) => column.editable)
      .sort((a, b) => {
        return props.muiDataGridApiRef.getColumnIndex(a.field) - props.muiDataGridApiRef.getColumnIndex(b.field);
      })
      .map((column) => column.field);

    const newSortedErrors = Object.keys(props.validationModel)
      .sort((a: GridRowId, b: GridRowId) => {
        // Sort row errors based on the current sorting of the rows
        return sortedRowIds.indexOf(a) - sortedRowIds.indexOf(b);
      })
      .reduce((errors: ITableValidationError<RowType>[], rowId: GridRowId) => {
        props.validationModel[rowId]
          .map((rowError) => ({ ...rowError, rowId }))
          .sort((a: ITableValidationError<RowType>, b: ITableValidationError<RowType>) => {
            // Sort all column errors based on the current order of the columns in the table
            return (
              sortedEditableColumnNames.indexOf(String(a.field)) - sortedEditableColumnNames.indexOf(String(b.field))
            );
          })
          .forEach((error: ITableValidationError<RowType>) => {
            errors.push(error);
          });

        return errors;
      }, []);

    return newSortedErrors;
  }, [numErrors]);

  const handlePrev = useCallback(() => {
    setIndex((prev) => {
      const next = prev === 0 ? numErrors - 1 : prev - 1;
      focusErrorAtIndex(next);
      return next;
    });
  }, [numErrors]);

  const handleNext = useCallback(() => {
    setIndex((prev) => {
      const next = prev === numErrors - 1 ? 0 : prev + 1;
      focusErrorAtIndex(next);
      return next;
    });
  }, [numErrors]);

  const indexIndicator = useMemo(() => {
    return numErrors > 0 ? `${index + 1}/${numErrors}` : '0/0';
  }, [numErrors, index]);

  const currentError = useMemo(() => {
    return sortedErrors[index];
  }, [sortedErrors, index]);

  const focusErrorAtIndex = useCallback((errorIndex: number) => {
    const focusedError = sortedErrors[errorIndex];
    if (!focusedError) {
      return;
    }

    const field = String(focusedError.field);
    const rowIndex = props.muiDataGridApiRef.getSortedRowIds().indexOf(focusedError.rowId);
    const colIndex = props.muiDataGridApiRef.getColumnIndex(field);
    const pageSize = props.muiDataGridApiRef.state.pagination.paginationModel.pageSize;
    const page = Math.floor((rowIndex + 1) / pageSize);

    props.muiDataGridApiRef.setPage(page);
    props.muiDataGridApiRef.setCellFocus(focusedError.rowId, field);
    props.muiDataGridApiRef.scrollToIndexes({ rowIndex, colIndex });

  }, [sortedErrors]);

  useEffect(() => {
    if (Object.keys(props.validationModel).length > 0) {
      setHideAlert(false);
    }

    if (index >= numErrors) {
      setIndex(numErrors > 0 ? numErrors - 1 : 0);
    }
  }, [props.validationModel]);

  return (
    <Collapse in={numErrors > 0 && !hideAlert}>
      <Box mt={2} mb={1} mx={1}>
        <Alert
          variant="outlined"
          severity="error"
          action={
            <Box display="flex" flexDirection="row" alignItems="center">
              <Typography>{indexIndicator}</Typography>
              <Divider orientation="vertical" flexItem variant="middle" sx={{ ml: 2, mr: 1, borderColor: 'inherit' }} />
              <Button color="inherit" startIcon={<Icon path={mdiChevronUp} size={1} />} onClick={() => handlePrev()}>
                Prev
              </Button>
              <Button color="inherit" startIcon={<Icon path={mdiChevronDown} size={1} />} onClick={() => handleNext()}>
                Next
              </Button>
              <IconButton color="inherit" onClick={() => setHideAlert(true)}>
                <Icon path={mdiClose} size={1} />
              </IconButton>
            </Box>
          }>
          <AlertTitle>Could not save observations: Validation failed</AlertTitle>
          <Typography variant="body2">
            <strong>Error {indexIndicator}</strong>
            {currentError && `: ${currentError.message}`}
          </Typography>
        </Alert>
      </Box>
    </Collapse>
  );
};

export default DataGridValidationAlert;
