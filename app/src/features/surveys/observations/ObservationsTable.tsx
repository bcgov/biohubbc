import { mdiDotsVertical, mdiTrashCan } from "@mdi/js";
import Icon from "@mdi/react";
import { Theme } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import { makeStyles } from "@mui/styles";
import { DataGrid, GridColDef, GridEventListener, GridRowEditStopReasons, GridRowModes } from '@mui/x-data-grid';
import { IObservationTableRow, ObservationsContext } from "contexts/observationsContext";
import { useContext } from "react";
// import { useEffect, useState } from "react";
import { pluralize as p } from "utils/Utils";

export type IObservationsTableProps = Record<never, any>;

const useStyles = makeStyles((theme: Theme) => ({
  modifiedRow: {} // { background: 'rgba(65, 168, 3, 0.16)' }
}));

const ObservationsTable = (props: IObservationsTableProps) => {
  const classes = useStyles();

  const observationColumns: GridColDef<IObservationTableRow>[] = [
    {
      field: 'speciesName',
      headerName: 'Species',
      editable: true,
      flex: 1,
      minWidth: 250,
      disableColumnMenu: true
    },
    {
      field: 'samplingSite',
      headerName: 'Sampling Site',
      editable: true,
      type: 'singleSelect',
      valueOptions: ['Site 1', 'Site 2', 'Site 3', 'Site 4'],
      flex: 1,
      minWidth: 200,
      disableColumnMenu: true
    },
    {
      field: 'samplingMethod',
      headerName: 'Sampling Method',
      editable: true,
      type: 'singleSelect',
      valueOptions: ['Method 1', 'Method 2', 'Method 3', 'Method 4'],
      flex: 1,
      minWidth: 200,
      disableColumnMenu: true
    },
    {
      field: 'samplingPeriod',
      headerName: 'Sampling Period',
      editable: true,
      type: 'singleSelect',
      valueOptions: ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Undefined'],
      flex: 1,
      minWidth: 200,
      disableColumnMenu: true
    },
    {
      field: 'count',
      headerName: 'Count',
      editable: true,
      type: 'number',
      minWidth: 100,
      disableColumnMenu: true,
    },
    {
      field: 'date',
      headerName: 'Date',
      editable: true,
      type: 'date',
      minWidth: 150,
      disableColumnMenu: true,
    },
    {
      field: 'time',
      headerName: 'Time',
      editable: true,
      type: 'time',
      width: 150,
      disableColumnMenu: true
    },
    {
      field: 'lat',
      headerName: 'Lat',
      type: 'number',
      editable: true,
      width: 150,
      disableColumnMenu: true
    },
    {
      field: 'long',
      headerName: 'Long',
      type: 'number',
      editable: true,
      width: 150,
      disableColumnMenu: true
    },
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      width: 96,
      disableColumnMenu: true,
      resizable: false,
      getActions: (params) => [
        (
          <IconButton onClick={() => handleDeleteRow(params.id)}>
            <Icon path={mdiTrashCan} size={1} />
          </IconButton>
        ),
        (
          <IconButton>
            <Icon path={mdiDotsVertical} size={1} />
          </IconButton>
        )
      ],
    }
  ];
  
  const { _rows, _setRows, _setRowModesModel, _rowModesModel } = useContext(ObservationsContext);
  
  const handleDeleteRow = (id: string | number) => {
    _setRows(_rows.filter((row) => row.id !== id));
  }

  // console.log('rowModesModel:', _rowModesModel);

  /*
  const handleRowEditStart: GridEventListener<'rowEditStart'> = (params, event) => {
    console.log({ params })
  }
  */

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    event.defaultMuiPrevented = true;
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      //
    }
  };

  const handleProcessRowUpdate = (newRow: IObservationTableRow) => {
    const updatedRow: IObservationTableRow = { ...newRow, _isModified: true };

    _setRows(_rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  /*
  const handleStateChange: GridEventListener<'stateChange'> = (params, event) => {
    // console.log('handleStateChange:', params);
  }
  */

  const handleCellClick: GridEventListener<'cellClick'> = (params, event) => {
    _setRowModesModel((oldModel) => ({
      ...oldModel,
      [params.row.id]: { mode: GridRowModes.Edit, fieldToFocus: params.field }
    }))
  }

  const numModified = _rows.filter((row) => row._isModified).length;

  return (
    <DataGrid
      // onStateChange={handleStateChange}
      editMode="row"
      onCellClick={handleCellClick}
      // onRowEditStart={handleRowEditStart}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={handleProcessRowUpdate}
      columns={observationColumns}
      rows={_rows}
      rowModesModel={_rowModesModel}
      disableRowSelectionOnClick
      onRowModesModelChange={_setRowModesModel}
      localeText={{
        noRowsLabel: "No Records",
        footerRowSelected: (numSelected: number) => {
          return [
            numSelected > 0 && `${numSelected} ${p(numSelected, 'row')} selected`,
            numModified > 0 && `${numModified} unsaved ${p(numModified, 'row')}`
          ].filter(Boolean).join(', ')
        }
      }}
      getRowClassName={(params) => {
        if (params.row._isModified || _rowModesModel) {
          return classes.modifiedRow;
        }

        return '';
      }}
      sx={{
        background: '#fff',
        border: 'none',
        '& .MuiDataGrid-pinnedColumns, .MuiDataGrid-pinnedColumnHeaders': {
          background: '#fff'
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 700,
          textTransform: 'uppercase',
          color: '#999'
        },
        '& .test': {
          position: 'sticky',
          right: 0,
          top: 0,
          borderLeft: '1px solid #ccc',
          background: '#fff'
        },
        '& .MuiDataGrid-columnHeaders': {
          position: 'relative'
        },
        '& .MuiDataGrid-columnHeaders:after': {
          content: "''",
          position: 'absolute',
          right: 0,
          width: '96px',
          height: '80px',
          borderLeft: '1px solid #ccc',
          background: '#fff'
        },
        '& .MuiDataGrid-actionsCell': {
          gap: 0
        }
      }}
    />
  )
}

export default ObservationsTable;
