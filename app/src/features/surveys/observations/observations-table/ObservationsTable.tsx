import { cyan, grey } from '@mui/material/colors';
import { DataGrid, GridColDef, GridColumnVisibilityModel, GridRowModesModel } from '@mui/x-data-grid';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { getSurveySessionStorageKey, SIMS_OBSERVATIONS_HIDDEN_COLUMNS } from 'constants/session-storage';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useObservationsTableContext } from 'hooks/useContext';
import { has } from 'lodash-es';
import { useCallback, useContext } from 'react';

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
  const { surveyId } = useContext(SurveyContext);

  const observationsTableContext = useObservationsTableContext();

  /**
   * Callback fired when the column visibility model changes.
   *
   * @param {GridColumnVisibilityModel} model
   */
  const onColumnVisibilityModelChange = useCallback(
    (model: GridColumnVisibilityModel) => {
      // Store current visibility model in session storage
      sessionStorage.setItem(
        getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_HIDDEN_COLUMNS),
        JSON.stringify(model)
      );

      // Update the column visibility model in the context
      observationsTableContext.setColumnVisibilityModel(model);
    },
    [observationsTableContext, surveyId]
  );

  /**
   * Callback fired when a row transitions from `view` mode to `edit` mode.
   *
   * @param {IObservationTableRow} newRow
   * @return {*}
   */
  const processRowUpdate = useCallback(
    (newRow: IObservationTableRow) => {
      if (observationsTableContext.savedRows.find((row) => row.id === newRow.id)) {
        // Update savedRows
        observationsTableContext.setSavedRows((currentSavedRows) =>
          currentSavedRows.map((row) => (row.id === newRow.id ? newRow : row))
        );
      } else {
        // Update stagedRows
        observationsTableContext.setStagedRows((currentStagedRows) =>
          currentStagedRows.map((row) => (row.id === newRow.id ? newRow : row))
        );
      }

      return newRow;
    },
    [observationsTableContext]
  );

  /**
   * Callback fired when the row modes model changes.
   * The row modes model stores the `view` vs `edit` state of the rows.
   *
   * Note: Any row not included in the model will default to `view` mode.
   *
   * @param {GridRowModesModel} model
   */
  const onRowModesModelChange = useCallback(
    (model: GridRowModesModel) => {
      observationsTableContext.setRowModesModel(() => model);
    },
    [observationsTableContext]
  );

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
        onColumnVisibilityModelChange={onColumnVisibilityModelChange}
        // Rows
        rows={[...observationsTableContext.savedRows, ...observationsTableContext.stagedRows]}
        processRowUpdate={processRowUpdate}
        // Row modes
        rowModesModel={observationsTableContext.rowModesModel}
        onRowModesModelChange={onRowModesModelChange}
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
            height: 55,
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%)'
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
