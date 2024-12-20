import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { useMemo } from 'react';
import { CSVError } from 'utils/csv-utils';
import { v4 } from 'uuid';
import { CSVErrorsTableOptionsMenu } from './CSVErrorsTableOptionsMenu';

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
      minWidth: 85
    },
    {
      field: 'header',
      headerName: 'Header',
      description: 'Column header in the CSV file',
      minWidth: 150,
      maxWidth: 250,
      renderCell: (params) => {
        return params.value?.toUpperCase();
      }
    },
    {
      field: 'cell',
      headerName: 'Cell',
      description: 'The cell value in the CSV file',
      minWidth: 85
    },
    {
      field: 'error',
      headerName: 'Error',
      description: 'The error message',
      flex: 1,
      minWidth: 250,
      resizable: true
    },
    {
      field: 'solution',
      headerName: 'Solution',
      description: 'The solution to the error',
      flex: 1,
      minWidth: 250,
      resizable: true
    },
    {
      field: 'values',
      headerName: 'Options',
      description: 'The applicable cell values',
      minWidth: 85,
      renderCell: (params) => {
        return params.value?.length ? <CSVErrorsTableOptionsMenu options={params.value} /> : 'N/A';
      }
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
      getRowHeight={() => 'auto'}
      rows={rows}
      getRowId={(row) => row.id}
      columns={columns}
      pageSizeOptions={[10, 25, 50]}
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
