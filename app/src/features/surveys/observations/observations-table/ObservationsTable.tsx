import { cyan, grey } from '@mui/material/colors';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { useObservationsTableContext } from 'hooks/useContext';
import { has } from 'lodash-es';

export interface ISpeciesObservationTableProps {
  /**
   * Manually control the loading state of the table.
   *
   * @type {boolean}
   * @memberof ISpeciesObservationTableProps
   */
  isLoading?: boolean;
  /**
   * The column definitions of the columns to render in the table.
   *
   * @type {GridColDef<IObservationTableRow>[]}
   * @memberof ISpeciesObservationTableProps
   */
  columns: GridColDef<IObservationTableRow>[];
}

const ObservationsTable = (props: ISpeciesObservationTableProps) => {
  const observationsTableContext = useObservationsTableContext();

  return (
    <>
      {props.isLoading && <SkeletonTable />}

      <DataGrid
        apiRef={observationsTableContext._muiDataGridApiRef}
        editMode="row"
        // Columns
        columns={props.columns}
        // Column visibility
        columnVisibilityModel={observationsTableContext.columnVisibilityModel}
        onColumnVisibilityModelChange={observationsTableContext.onColumnVisibilityModelChange}
        // Rows
        rows={[...observationsTableContext.stagedRows, ...observationsTableContext.savedRows]}
        processRowUpdate={observationsTableContext.processRowUpdate}
        // Row modes
        rowModesModel={observationsTableContext.rowModesModel}
        onRowModesModelChange={observationsTableContext.onRowModesModelChange}
        // Pagination
        paginationMode="server"
        rowCount={observationsTableContext.observationCount}
        pageSizeOptions={[25, 50, 100]}
        paginationModel={observationsTableContext.paginationModel}
        onPaginationModelChange={observationsTableContext.setPaginationModel}
        // Sorting
        sortingMode="server"
        sortModel={observationsTableContext.sortModel}
        onSortModelChange={observationsTableContext.setSortModel}
        // Row editing
        onRowEditStart={(params) => observationsTableContext.onRowEditStart(params.id)}
        onRowEditStop={(_params, event) => {
          event.defaultMuiPrevented = true;
        }}
        // Row selection
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={observationsTableContext.rowSelectionModel}
        onRowSelectionModelChange={observationsTableContext.onRowSelectionModelChange}
        // Styling
        localeText={{
          noRowsLabel: 'No Records'
        }}
        rowHeight={56}
        getRowHeight={() => 'auto'}
        getRowClassName={(params) => (has(observationsTableContext.validationModel, params.row.id) ? 'error' : '')}
        sx={{
          border: 'none',
          borderRadius: 0,
          '&:after': {
            content: '" "',
            position: 'absolute',
            top: 0,
            right: 0,
            width: 100,
            height: 55
          },
          '& .pinnedColumn': {
            position: 'sticky',
            right: 0,
            top: 0,
            borderLeft: '1px solid' + grey[300]
          },
          '& .MuiDataGrid-columnHeaders': {
            position: 'relative',
            background: grey[50]
          },
          '& .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none',
            background: grey[200]
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'text.secondary'
          },
          '& .MuiDataGrid-cell': {
            py: 0.75,
            background: '#fff',
            '&.MuiDataGrid-cell--editing:focus-within': {
              outline: 'none'
            },
            '&.MuiDataGrid-cell--editing': {
              p: 0.5,
              backgroundColor: cyan[100]
            }
          },
          '& .MuiDataGrid-row--editing': {
            boxShadow: 'none',
            backgroundColor: cyan[50],
            '& .MuiDataGrid-cell': {
              backgroundColor: cyan[50]
            },
            '&.error': {
              '& .MuiDataGrid-cell, .MuiDataGrid-cell--editing': {
                backgroundColor: 'rgb(251, 237, 238)'
              }
            }
          },
          '& .MuiDataGrid-editInputCell': {
            border: '1px solid #ccc',
            '&:hover': {
              borderColor: 'primary.main'
            },
            '&.Mui-focused': {
              borderColor: 'primary.main',
              outlineWidth: '2px',
              outlineStyle: 'solid',
              outlineColor: 'primary.main',
              outlineOffset: '-2px'
            }
          },
          '& .MuiInputBase-root': {
            height: '40px',
            borderRadius: '4px',
            background: '#fff',
            fontSize: '0.875rem',
            '&.MuiDataGrid-editInputCell': {
              padding: 0
            }
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
            background: '#fff',
            border: 'none',
            '&:hover': {
              borderColor: 'primary.main'
            },
            '&:hover > fieldset': {
              border: '1px solid primary.main'
            }
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: '1px solid ' + grey[300],
            '&.Mui-focused': {
              borderColor: 'primary.main'
            }
          },
          '& .MuiDataGrid-virtualScrollerContent, .MuiDataGrid-overlay': {
            background: grey[100]
          }
        }}
      />
    </>
  );
};

export default ObservationsTable;
