import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { useMemo } from 'react';
import { CSVError } from 'utils/file-utils';
import { v4 } from 'uuid';

interface CSVErrorsTableProps {
  errors: CSVError[];
}

/**
 * Renders a CSV errors table.
 *
 * @param {CSVErrorsTableProps} props
 * @returns {*} {JSX.Element}
 */
export const CSVErrorsTable = (props: CSVErrorsTableProps) => {
  const columns: GridColDef[] = [
    {
      field: 'row',
      headerName: 'Row',
      description: 'Row number in the CSV file',
      type: 'number'
    },
    {
      field: 'header',
      headerName: 'Header',
      description: 'Column header in the CSV file',
      minWidth: 150,
      maxWidth: 200,
      type: 'string'
    },
    {
      field: 'error',
      headerName: 'Error',
      description: 'The error message',
      flex: 2,
      type: 'string'
    },
    {
      field: 'solution',
      headerName: 'Solution',
      description: 'The solution to the error',
      flex: 2,
      type: 'string'
    },
    {
      field: 'cell',
      headerName: 'Cell',
      description: 'The cell value in the CSV file',
      type: 'string'
    }
  ];

  const rows = useMemo(() => {
    return props.errors.map((error) => {
      return {
        id: v4(),
        ...error
      };
    });
  }, [props.errors]);

  return (
    <StyledDataGrid
      noRowsMessage={'No validation errors found'}
      autoHeight
      rows={rows}
      getRowId={(row) => row.id}
      columns={columns}
      pageSizeOptions={[5, 10, 20, 100]}
      rowSelection={false}
      checkboxSelection={false}
      sortingOrder={['asc', 'desc']}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 5
          }
        }
      }}
    />
  );
};
