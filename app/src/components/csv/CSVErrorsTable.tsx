import { mdiChevronDown } from '@mdi/js';
import Icon from '@mdi/react';
import { Button, Menu, MenuItem } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { useMemo, useState } from 'react';
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
        return params.value?.length ? (
          <>
            <Button
              onClick={(event) => setAnchorEl(event.currentTarget)}
              size="small"
              variant="outlined"
              endIcon={<Icon path={mdiChevronDown} size={0.8} />}>
              View
            </Button>
            <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
              {(params.value as string[]).map((value) => (
                <MenuItem key={`csv-error-option-${value}`}>{value}</MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          'N/A'
        );
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
